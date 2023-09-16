from flask import Flask, request, jsonify
from transformers import pipeline
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Define the directory where uploaded images are stored
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    image = request.files['image']

    if image.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Save the uploaded image to the uploads folder
    image_path = os.path.join(app.config['UPLOAD_FOLDER'], image.filename)
    image.save(image_path)

    # Pass the local file path to the Transformers pipeline
    captioner = pipeline("image-to-text", model="Salesforce/blip-image-captioning-base")
    captions = captioner(image_path)

    result = [{'generated_text': caption['generated_text']} for caption in captions]
    print(result)

    return jsonify(result)

if __name__ == '__main__':
    app.run()
