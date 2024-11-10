# pyIjs

**Py-I-Js** (Python-IFC-Javascript) is a project focused on bridging the gap between viewing IFC models and editing their information.

The viewer leverages the open-source [openbim-components](https://github.com/ThatOpen/engine_components) library, offering advanced visualization capabilities through the state-of-the-art [IfcStreamer](https://docs.thatopen.com/Tutorials/Components/Front/IfcStreamer) technology.

Once an uploaded model is converted to "tiles" (including both geometries and properties), the viewer dynamically loads and unloads model elements based on the camera angle and position, enhancing performance and user experience. This approach ensures that only the relevant geometries and properties are displayed as the camera moves, providing a seamless interaction with large models. By utilizing the modular components from openbim-components, the viewer can be customized extensively to meet specific project requirements.

Previously known as Ifcjs, openbim-components play a pivotal role in the open BIM ecosystem, particularly in handling IFC models. However, implementing IfcStreamer requires substantial back-end processing power. For IFC data manipulation, the IfcOpenShell community offers a mature and stable framework, especially when combined with Python’s rich ecosystem of data science libraries. This integration supports efficient data handling and enhanced interoperability in the open BIM field.

![intro](/media/intro.gif)

## How to Use

This repository is created using Flask framework. 
Following the schema of Flask, the application automatically renders `templates/index.html` as its front-end, along with `static/js/script.js` and `static/css/styles.css`, and all the public files should be located the in the `static` folder, such as Ifc models in `static/ifc` or the converted tile files in `static/ifc/converted`.

### Back-end

#### Run with a local host

To run the app with a local host, just open downloaded repository folder in your terminal if it's on Mac or Linux. For Windows, my recommendation would be to install the [Windows Subsystem for Linux](https://learn.microsoft.com/en-us/windows/wsl/install), and run with Linux subsystem. Then, create a virtual environment in the root folder, activate it and **restore** all the packages by running 

`pip install -r requirements.txt`

Finally, with virtual environment activated, in the terminal execute:

`gunicorn -w 1 -k eventlet -b localhost:8000 app:app`

Open your browser at `localhost:8000`, you'll see the viewer is up and running. 

#### Run on Google Cloud

For Google users, Google Cloud Platform provides $300 in free credits for 90 days to check out its 20+ products. It's definitely worth to tryout!

To deploy this repository to the cloud, execute this command in the app folder.

```gcloud run deploy --source .```

This will upload all your contents to your Google Cloud Platform and the app will run with Docker container. Modify the `Dockerfile` accordingly.

### Converter

The `converter` folder itself is a npm project. To restore it, run `yarn install` in the terminal. 

When tbe conversion starts, the Flask applicaiton uses a subprocess to generate tile with `converter/index.js`. The tile files will be generated in the `static/ifc/converted` folder, further with the same structure as the given Ifc model: `client/project/model.ifc`

### Front-end

The front-end showing in the browser is a built distribution from `frontend` folder, which is also a npm project. To modify the front-end, the project can be restored with running `yarn install` and to build it with `yarn build`. At the moment, the `script.js` and `styles.css` have to be copied to `static/js` and `static/css/` respectively. Since you might be testing your front-end separately without running the back-end Flask server, if there is any change in your `index.html`, don't forget to modify the one in the `templates` folder accordingly.

## Next steps

- [ ] Possibility to include the frontend project without building it?
- [ ] Interface to upload Ifc model. 
- [ ] Trigger conversion once the Ifc model is uploaded.
- [ ] Connection to Google Cloud Storage / Google Drive.

