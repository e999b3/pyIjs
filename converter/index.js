import * as fs from "fs";
import * as OBC from "@thatopen/components";
import * as WEBIFC from "web-ifc";

async function generateTiles(regenerate, client, proj, ifcIn) {
  const structure = `${client}/${proj}`
  // const input = fs.openSync(`./resources/lib/${inputName}.ifc`);
  const input = fs.openSync(`./static/ifc/${structure}/${ifcIn}.ifc`);
  // const outPath = `./resources/converted/${outputName}/`;
  const outPath = `./static/ifc/converted/${structure}/`;

  // If input file doesn't exist, program exits
  if (!fs.existsSync(input)) {
    console.log(`File ${input} does not exist.`);
    process.exit(1);
  }

  let forced = (regenerate.toLowerCase() === "true");

  if (fs.existsSync(outPath)) {
    // fs.rmSync(outPath, { recursive: true, force: true });
    console.log(`Folder ${outPath} exists`);
  } else {
    forced = true
    fs.mkdirSync(outPath, { recursive: true });
    console.log(`Folder ${outPath} created`);
  }

  if (forced) { // If forced to regenerate tile, ...

    const callback = (offset, size) => {
      let data = new Uint8Array(size);
      let bytesRead = fs.readSync(input, data, 0, size, offset);
      if (bytesRead <= 0) return new Uint8Array(0);
      return data;
    };

    const components = new OBC.Components();
  
    // Convert geometry
  
    const geometryTiler = new OBC.IfcGeometryTiler(components);
  
    geometryTiler.settings.excludedCategories.add(WEBIFC.IFCSPACE);
  
    geometryTiler.settings.webIfc = {
      // MEMORY_LIMIT: 2147483648, // default: 2GB
      COORDINATE_TO_ORIGIN: true,
      OPTIMIZE_PROFILES: true,
    };
  
    geometryTiler.settings.minAssetsSize = 1000;
    geometryTiler.settings.minGeometrySize = 20;
  
    console.log(`Starting file conversion to fragments...`);
  
    let geometryFilesCount = 1;
    let geometriesData = {};
    let assetsData = [];
  
    geometryTiler.onGeometryStreamed.add((geometry) => {
      const { buffer, data } = geometry;
      const bufferFileName = `${ifcIn}.ifc-processed-geometries-${geometryFilesCount}`;
      for (const expressID in data) {
        const value = data[expressID];
        value.geometryFile = bufferFileName;
        geometriesData[expressID] = value;
      }
      fs.writeFileSync(outPath + bufferFileName, buffer);
      geometryFilesCount++;
    });
  
    geometryTiler.onAssetStreamed.add((assets) => {
      assetsData = [...assetsData, ...assets];
    });
  
    geometryTiler.onIfcLoaded.add((buffer) => {
      fs.writeFileSync(outPath + `${ifcIn}.ifc-processed-global`, buffer);
  
      const processedData = {
        geometries: geometriesData,
        assets: assetsData,
        globalDataFileId: `${ifcIn}.ifc-processed-global`,
      };
  
      const result = JSON.stringify(processedData);
  
      fs.writeFileSync(outPath + `${ifcIn}.ifc-processed.json`, result);
    });
  
    geometryTiler.onProgress.add((progress) => {
      console.log(progress);
    });
  
    await geometryTiler.streamFromCallBack(callback);
  
  // Convert properties
  
    console.log("Generating properties tiles...");
  
    const propsTiler = new OBC.IfcPropertiesTiler(components);
  
    const jsonFile = {
      types: {},
      ids: {},
      indexesFile: `${ifcIn}.ifc-processed-properties-indexes`,
    };
  
    let counter = 0;
  
    propsTiler.onPropertiesStreamed.add(async (props) => {
      if (!jsonFile.types[props.type]) {
        jsonFile.types[props.type] = [];
      }
      jsonFile.types[props.type].push(counter);
  
      for (const id in props.data) {
        jsonFile.ids[id] = counter;
      }
  
      const name = `${ifcIn}.ifc-processed-properties-${counter}`;
      fs.writeFileSync(outPath + name, JSON.stringify(props.data));
  
      counter++;
    });
  
    propsTiler.onProgress.add(async (progress) => {
      console.log(progress);
    });
  
    propsTiler.onIndicesStreamed.add(async (props) => {
      const jsonName = `${ifcIn}.ifc-processed-properties.json`;
      fs.writeFileSync(outPath + jsonName, JSON.stringify(jsonFile));
  
      const relations = components.get(OBC.IfcRelationsIndexer);
      const serializedRels = relations.serializeRelations(props);
      const relsName = `${ifcIn}.ifc-processed-properties-indexes`;
      fs.writeFileSync(outPath + relsName, serializedRels);
    });
  
    await propsTiler.streamFromCallBack(callback);
  }

}

const regenerate = process.argv[2]
const client = process.argv[3]
const proj = process.argv[4]
const model = process.argv[5]
await generateTiles(regenerate, client, proj, model);
