from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from threading import Lock

app = Flask(__name__)
CORS(app, resources={r"/add_material": {"origins": "*"}}, supports_credentials=True)

lock = Lock()

@app.route('/add_material', methods=['POST'])
def add_material():
    data = request.get_json()
    if data is None:
        return jsonify({'message': 'Invalid input'}), 400

    # Lock to prevent concurrent write issues
    lock.acquire()

    # {'type': 'x', 'value': 3} -> {'value': 3}
    form_type = data.pop('type')

    data['blends_well_with'] = data['blends_well_with'].split(', ')

    file_path = None
    if form_type == 'naturals':
        file_path = 'naturals.json' 
    elif form_type == 'synthetics':
        file_path = 'synthetics.json'
    else:
        return jsonify({'message': f'Error: {form_type}'}), 400

    try:
        # Read existing data
        if os.path.exists(file_path):
            with open(file_path, 'r') as f:
                try:
                    materials = json.load(f)
                except json.JSONDecodeError:
                    return jsonify({'message': f'Error decoding json file: {file_path}'}), 400
        else:
            materials = []

        # Append new data
        materials.append(data)

        # Write back to the file
        with open(file_path, 'w') as f:
            json.dump(materials, f, indent=4)
        print('Saved.')
    finally:
        lock.release()

    return jsonify({'message': 'Material added successfully'}), 200

if __name__ == '__main__':
    app.run(debug=True)
