# pyIjs

**Py-I-Js** (Python-IFC-Javascript) is a project focused on bridging the gap between viewing IFC models and editing their properties.

The viewer leverages the open-source [openbim-components](https://github.com/ThatOpen/engine_components) library, offering advanced visualization capabilities through the state-of-the-art [IfcStreamer](https://docs.thatopen.com/Tutorials/Components/Front/IfcStreamer) technology.

Once an uploaded model is converted to "tiles" (including both geometries and properties), the viewer dynamically loads and unloads model elements based on the camera angle and position, enhancing performance and user experience. This approach ensures that only the relevant geometries and properties are displayed as the camera moves, providing a seamless interaction with large models. By utilizing the modular components from openbim-components, the viewer can be customized extensively to meet specific project requirements.

Previously known as Ifcjs, openbim-components play a pivotal role in the open BIM ecosystem, particularly in handling IFC models. However, implementing IfcStreamer requires substantial back-end processing power. For IFC data manipulation, the IfcOpenShell community offers a mature and stable framework, especially when combined with Python’s rich ecosystem of data science libraries. This integration supports efficient data handling and enhanced interoperability in the open BIM field.

![intro](/media/intro.gif)

## Converter


## Front-end

## Back-end

### Run with a local host

To run the app with a local host is simple, just open your terminal on Mac or Linux and for Windows, my recommendation would be to install the [Windows Subsystem for Linux](https://learn.microsoft.com/en-us/windows/wsl/install), and with a virtual environment activated in the terminal execute:

`gunicorn -w 1 -k eventlet -b localhost:8000 app:app`

### Run on Google Cloud

For Google users, Google Cloud Platform provides $300 in free credits for 90 days to check out its 20+ products. To deploy this repository to the cloud, execute this command in the app folder.

```gcloud run deploy --source .```