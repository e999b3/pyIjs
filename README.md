# pyIjs

**Py-I-Js** (Python-IFC-Javascript) is an innovative project designed to bridge the gap between viewing IFC models and editing their associated information.

## Overview

The project utilizes the open-source [openbim-components](https://github.com/ThatOpen/engine_components) library to provide advanced visualization capabilities powered by the cutting-edge [IfcStreamer](https://docs.thatopen.com/Tutorials/Components/Front/IfcStreamer) technology.

### Key Features

- **Dynamic Loading**: Uploaded IFC models are converted into "tiles," encompassing both geometries and properties. The viewer dynamically loads and unloads model elements based on the camera's angle and position, ensuring high performance and seamless interaction with large models.
- **Customizable Viewer**: Leveraging the modularity of openbim-components, the viewer can be tailored to specific project requirements, enhancing usability and scalability.
- **Robust Integration**: By combining the power of [IfcOpenShell](https://github.com/IfcOpenShell/IfcOpenShell) for IFC data manipulation with Python’s extensive data science ecosystem, this solution supports efficient data handling and advanced interoperability within the open BIM field.

![Introduction](/media/intro.gif)

---

## Getting Started

This repository is built using the **Flask** framework. Following Flask's structure:
- The front-end is rendered from `templates/index.html`.
- Supporting static files such as JavaScript, CSS, and IFC models are located in the `static` folder.

### Back-end Setup

#### Local Deployment

To deploy locally:

1. Open the project directory in your terminal (Linux/macOS users). For Windows users, it’s recommended to install the [Windows Subsystem for Linux (WSL)](https://learn.microsoft.com/en-us/windows/wsl/install).
2. Create a virtual environment in the root folder:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install required packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the Flask app using Gunicorn with Eventlet:
   ```bash
   gunicorn -w 1 -k eventlet -b localhost:8000 app:app
   ```

Open your browser and navigate to `http://localhost:8000` to access the viewer.

#### Deployment on Google Cloud

**Google Cloud Platform** offers **$300** in free credits for 90 days, providing an excellent opportunity to test its services.

To deploy the app:

1. Navigate to the project directory.
2. Run the following command:
   ```bash
   gcloud run deploy --source .
   ```
3. Modify the `Dockerfile` as needed for your specific requirements.

### Converter

The `converter` folder contains an npm project responsible for IFC-to-tile conversions. To set it up:

1. Install dependencies:
   ```bash
   yarn install
   ```
2. The Flask application invokes the `converter/index.js` file as a subprocess to generate tiles. These tiles are saved in `static/ifc/converted`, maintaining the structure of the original IFC model (e.g., `client/project/model.ifc`).

### Front-end

The front-end interface is built using the `frontend` folder (also an npm project). To customize it:

1. Install dependencies:
   ```bash
   yarn install
   ```
2. Build the project:
   ```bash
   yarn build
   ```
3. Copy the generated `script.js` and `styles.css` files to the `static/js` and `static/css` folders, respectively. Ensure any updates to `index.html` are synchronized with the version in the `templates` folder.

---

## Next Steps

- [ ] Integrate the front-end project without requiring manual builds.
- [ ] Add an interface for uploading IFC models.
- [ ] Automate the conversion process upon model upload.
- [ ] Establish connections to cloud storage solutions like Google Cloud Storage or Google Drive.
