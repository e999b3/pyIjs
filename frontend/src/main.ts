// import './style.css'
// import typescriptLogo from './typescript.svg'
// import viteLogo from '/vite.svg'
// import { setupCounter } from './counter.ts'

// document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
//   <div>
//     <a href="https://vitejs.dev" target="_blank">
//       <img src="${viteLogo}" class="logo" alt="Vite logo" />
//     </a>
//     <a href="https://www.typescriptlang.org/" target="_blank">
//       <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
//     </a>
//     <h1>Vite + TypeScript</h1>
//     <div class="card">
//       <button id="counter" type="button"></button>
//     </div>
//     <p class="read-the-docs">
//       Click on the Vite and TypeScript logos to learn more
//     </p>
//   </div>
// `

// setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)

// import * as THREE from 'three'
import * as OBC from "@thatopen/components"
import * as OBF from "@thatopen/components-front"

const container = document.getElementById("container")!;

const components = new OBC.Components();

const worlds = components.get(OBC.Worlds)
const world = worlds.create<
  OBC.SimpleScene,
  OBC.OrthoPerspectiveCamera, 
  OBF.PostproductionRenderer
>();

world.name = "pyIjs";

// Setup scene, renderer and camera for the world
world.scene = new OBC.SimpleScene(components)
world.renderer = new OBF.PostproductionRenderer(components, container);
world.camera = new OBC.OrthoPerspectiveCamera(components);

world.scene.setup();
world.scene.three.background = null;

// Setup grid
const grid = components.get(OBC.Grids).create(world);
grid.material.uniforms.uSize1.value = 2;
// grid.material.uniforms.usize2.value = 8;

// Resize
const resizeWorld = () => {
  world.renderer?.resize();
  world.camera.updateAspect();
}
container.addEventListener("resize", resizeWorld);

components.init();

// Screen culler - why do we need it?
const culler = 
  components.get(OBC.Cullers)
    .create(world);
culler.threshold = 5;


// // Load chucks
// const chuckLoader = components.get(OBF.IfcStreamer);
// chuckLoader.world = world;
// chuckLoader.culler.threshold = 10;
// chuckLoader.culler.maxHiddenTime = 1000;
// chuckLoader.culler.maxLostTime = 10000;

// let client;
// let project;
// document.getElementById('submit')?.addEventListener('click', (ev) => {
//   client = document.getElementById('client')!.innerText;
// })


declare const io: any;
const socket = io(
    {reconnection: true,       // Enable reconnection
    reconnectionAttempts: 5,  // Try to reconnect 5 times before giving up
    reconnectionDelay: 1000,  // Wait 1 second before trying to reconnect
    timeout: 20000}  
);

// Handle form submission
document.getElementById('inputForm')?.addEventListener('submit', (e) => {
  e.preventDefault(); // Prevent traditional form submission
  // Setup visual
  document.getElementById('spinner')!.style.display = 'block';

  // Get client, project and model values
  const regenerate = (document.getElementById('regenerate')! as HTMLInputElement).checked
  const client = (document.getElementById('client')! as HTMLInputElement).value
  const project = (document.getElementById('project')! as HTMLInputElement).value
  const model = (document.getElementById('model')! as HTMLInputElement).value

  // Send user input to the server
  socket.emit('user_inputs', {
    regenerate: regenerate, client: client, project: project, model: model
  });

  // Update status to indicate process started
  document.getElementById('status')!.innerText = 'Converting...';
});


socket.on('process_completed', (data: {
  url:string, regenerate: boolean, client: string, project: string, model: string
}) => {
  document.getElementById('status')!.innerText = `Setting up showing converted model. Forced to regenerate: ${data.regenerate}`;
  document.getElementById('spinner')!.style.display = 'none';

  console.log(data);
  const baseUrl = `${data.url}/static/ifc/converted/${data.client}/${data.project}/`

  // Stremer
  const streamer = components.get(OBF.IfcStreamer);
  streamer.url = baseUrl
  streamer.world = world;
  streamer.culler.threshold = 10;
  streamer.culler.maxHiddenTime = 1000;
  streamer.culler.maxLostTime = 30000;

  const streamIt = async (baseName:string) => {
    const geomUrl = `${baseUrl}${baseName}.ifc-processed.json`
    const propUrl = `${baseUrl}${baseName}.ifc-processed-properties.json`
  
    // Stream json information
    const geomDataRaw = await fetch(geomUrl);
    const geomData = await geomDataRaw.json();
  
    let propData;
    if(propUrl){
      const propDataRaw = await fetch(propUrl);
      propData = await propDataRaw.json();
    }
  
    await streamer.load(geomData, true, propData);
  
  }

  streamIt(data.model);

  document.getElementById('status')!.innerText = 'Viewing model.';

  // world.camera.controls.fitToBox(
  //   new THREE.Box3().setFromObject(world.scene.three), 
  //   true
  // )

  // When the camera stop moving (as event 'sleep')
  // then update the streamer
  world.camera.controls.addEventListener("sleep", () => {
    culler.needsUpdate = true;
    streamer.culler.needsUpdate = true;
  });
})

// highlighter
const highlighter = components.get(OBF.Highlighter);
highlighter.setup({world});
highlighter.zoomToSelection = true;
highlighter.multiple = "shiftKey";

// const fragmentManager = components.get(OBC.FragmentsManager)

const serialized = (object: {[key:string]: Set<number>}) => {
  return Object.entries(object).map(
    ([key, valueSet]) => [key, Array.from(valueSet)]
    )
}

// function serialize(object: { [key:string]: Set<number>}) {
//   return Object.entries(object).map(
//     ([key, valueSet]) => [key, Array.from(valueSet)]
//   );
// }

highlighter.events.select.onHighlight.add((fragIdMap) => {
  console.log(typeof(fragIdMap))
  console.log(fragIdMap)

  console.log(highlighter.selection);

  socket.emit('highlighted', serialized(fragIdMap))
});



// // Initialize variables for user inputs
// var client:string;
// var project:string;
// var model:string;
// // After submit button clicked, send server the user inputs
// document.getElementById('submit_button')?.addEventListener('click', () => {
//   fetch('/submit', { method: 'POST' });

//   client = (document.getElementById('client')! as HTMLInputElement).value;
//   project = (document.getElementById('project')! as HTMLInputElement).value;
//   model = (document.getElementById('model')! as HTMLInputElement).value;
//   console.log(client, project, model);
//   // Sent the inputs to the server
//   socket.emit('userInputs', {
//     client:client, project:project, model:model 
//   })
//   document.getElementById('spinner')!.style.display = 'block';
// })

// // Listen to the server response, and wait for completed
// socket.on('server_response', (data: {status: string}) => {
//   // console.log("Server status:", data.status);
//   console.log(data);  // Log the data object to inspect its structure
//   // Showing server status with element (id: status)
//   if (data.status) {
//       document.getElementById('status')!.innerText = data.status;
//   } else {
//       console.error('Message key not found in the server response');
//   }
//   // When server completed converting, show the model
//   if (data.status === 'completed') {
//     document.getElementById('spinner')!.style.display = 'none';

//     const baseUrl = `http://127.0.0.1:8000/static/ifc/converted/${client}/${project}`

//     // Stremer
//     const streamer = components.get(OBF.IfcStreamer);
//     streamer.url = baseUrl
//     streamer.world = world;
//     streamer.culler.threshold = 10;
//     streamer.culler.maxHiddenTime = 1000;
//     streamer.culler.maxLostTime = 30000;

//     const streamIt = async (baseName:string) => {
//       const geomUrl = `${baseUrl}${baseName}-processed.json`
//       const propUrl = `${baseUrl}${baseName}-processed-properties.json`
    
//       // Stream json information
//       const geomDataRaw = await fetch(geomUrl);
//       const geomData = await geomDataRaw.json();
    
//       let propData;
//       if(propUrl){
//         const propDataRaw = await fetch(propUrl);
//         propData = await propDataRaw.json();
//       }
    
//       await streamer.load(geomData, true, propData);
    
//     }

//     streamIt(model);

//     // When the camera stop moving (as event 'sleep')
//     // then update the streamer
//     world.camera.controls.addEventListener("sleep", () => {
//       culler.needsUpdate = true;
//       streamer.culler.needsUpdate = true;
//     });
//   }
// })



// const baseUrl = "http://127.0.0.1:5500/static/ifc/converted/revicasa/corrkw/"

// const baseNames = [
//   "bes.ifc",
//   "abb.ifc",
//   "umg.ifc"
// ]




// // Stream all of the modells by their names
// baseNames.forEach((baseName) => {
//   streamIt(baseName)
// })

// // window.setTimeout(() => {
// //   streamer.culler.needsUpdate = true;
// // }, 1000);

// // When the camera stop moving (as event 'sleep')
// // then update the streamer
// world.camera.controls.addEventListener("sleep", () => {
//   culler.needsUpdate = true;
//   streamer.culler.needsUpdate = true;
// });

// // Add terminal
// declare const Terminal:any;
// document.addEventListener('DOMContentLoaded', function() {
//   const terminal = new Terminal();
//   const terminalContainer = document.getElementById('terminal');
//   terminal.open(terminalContainer);
  
//   // Add a greeting message
//   terminal.write('Welcome to the Web Terminal\r\n');

//   // Hook up keypress events
//   terminal.onKey((e:any) => {
//       const input = e.key;
//       terminal.write(input); // Display what the user types
//       // Send the input to the backend (use WebSocket or AJAX)
//   });
// });