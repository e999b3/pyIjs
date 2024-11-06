from flask import Flask, session, render_template, request
from flask_socketio import SocketIO, emit
from functools import wraps
# from livereload import Server
import subprocess, threading
from pathlib import Path
import json, pprint
import ifcopenshell
from urllib.parse import urlparse

# Run this in terminal:
# gunicorn --worker-class eventlet -w 1 app:app

# Create an Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cor_allowed_origin="*")

@app.route('/')
def index():
    return render_template('index.html')

# WebSocket to communicate between server (Flask) and frontend (ifcjs) 
# Trigger when the client connects
@socketio.on('connect')
def handle_connect():
    emit('server_response', {'status': 'Server is waiting for client inputs.'})  # Send initial status when connected

# WebSocket: Receive client, project and model inputs from the frontend
@socketio.on('user_inputs')
def handle_user_inputs(data):
    # Once user input is triggered
    host_url = request.host_url
    parsed_url = urlparse(host_url)
    # Check if the scheme is HTTPS
    if parsed_url.scheme != "https":
        url = parsed_url._replace(scheme="https").geturl()
    else:
        url = host_url
    print(url)
    regenerate = data['regenerate']
    client = data['client']
    project = data['project']
    model = data['model']

    # Store the input info in session of Flask
    session['regenerate'] = regenerate
    session['client'] = client
    session['project'] = project
    session['model'] = model

    print(f"Received client: {client}, project: {project}, model: {model}.ifc")

    ifc_pth = f"./static/ifc/{client}/{project}/{model}.ifc"
    session['ifc'] = ifcopenshell.open(ifc_pth)

    # Start long-running process in a separate thread
    threading.Thread(target=run_conversion, args=(url, regenerate, client, project, model)).start()

    # Post the opened model info on server
    socketio.emit('user_opens', {'model_path': ifc_pth})

def run_conversion(url, regen, client, project, model):     
    print(f"User entered: must regenerate: {regen} / client: {client} / \
project:{project} / model: {model}.ifc")

    js = r'./converter/index.js'

    try:
        result = subprocess.Popen(
            ['node', js, str(regen), client, project, model], 
            #check=True, 
            stdout=subprocess.PIPE, 
            stderr=subprocess.PIPE,
            text=True
        )
        for line in iter(result.stdout.readline, ''):
            try:
                socketio.emit('in_process', {'processed': f"{float(line)*100}%"})
            except:
                socketio.emit('in_process', {'processed': line})

        # Notify the client that the process is completed
        socketio.emit('process_completed', {'url': url, 'regenerate': regen, 'client': client, 'project': project, 'model': model})

    except subprocess.CalledProcessError as e:
        print(f"Error: {e.stderr.decode('utf-8')}")
        socketio.emit('server_response', {'status': 'error'})

def read_json(pth):
    with open(pth, 'r') as f:
        propdata = json.load(f)
    return propdata
def get_property_of(element_id:int):
    client = session['client']
    project = session['project']
    model = f"{session['model']}.ifc"
    dir_proj = f'./static/ifc/converted/{client}/{project}'
    pth_proj = Path(dir_proj)
    # fidxs = pth_proj.glob(f"{model}*-properties-indexes") # Get index json
    fjsns = pth_proj.glob(f"{model}*-properties.json") # Get property json
    datajsn = read_json(next(fjsns, None)) # Read property json file as dict
    n = datajsn['ids'][str(element_id)] # Find the file number
    fprops = pth_proj.glob(f"{model}*-processed-properties-{n}") # Get tile file
    return read_json(next(fprops, None))[str(element_id)] # Read tile file as dict and find the property

# When the highlighting event runs
@socketio.on('highlighted')
def show_highlighted(data):
    print('highlighted', dict(data))
    element_ids = []
    selected_guids = []
    for key, value in dict(data).items():
        for v in value:
            element_ids.append(v)
    for eid in element_ids:
        prop = get_property_of(eid)
        pprint.pprint(prop)
        guid = prop['GlobalId']['value']
        e = session['ifc'].by_guid(guid)
        pprint.pprint(e)
        selected_guids.append(guid)
    socketio.emit('highlighting', {
        'guids': selected_guids
        })

# WebSocket: Notify when client disconnects
@socketio.on('disconnect')
def handle_disconnect():
    print("Client disconnected")

# Test get data from Jupyter
@socketio.on('feeds')
def handle_message(data):
    print(f"Received message: {data}")
    socketio.emit('response', {'message': 'Message received by Flask'})

if __name__=='__main__':
    # socketio.run(app, host='0.0.0.0', port=8080, debug=True)
    socketio.run(app, port=8080, debug=True)

