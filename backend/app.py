"""
Flask application that provides an API to interact with Montreal Forced Aligner.
"""
import os
import uuid
import tempfile
from pathlib import Path
import logging
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from werkzeug.utils import secure_filename

from mfa_service import analyze_pronunciation

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = os.getenv('UPLOAD_FOLDER', 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size

# Enable CORS
CORS(app)

# Create upload folder if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'ok',
        'message': 'MFA API is running',
        'mfa_version': os.popen('mfa version').read().strip()
    })

@app.route('/api/analyze_pronunciation', methods=['POST'])
def handle_analyze_pronunciation():
    """
    Endpoint to analyze pronunciation using MFA.
    
    Expects:
    - 'audio' file in the request
    - 'expected_text' in the form data
    
    Returns:
    - JSON with pronunciation analysis results
    """
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        
        audio_file = request.files['audio']
        if audio_file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
            
        expected_text = request.form.get('expected_text', '')
        if not expected_text:
            return jsonify({'error': 'No expected text provided'}), 400
        
        # Save the uploaded file to a temporary location
        filename = secure_filename(audio_file.filename)
        temp_dir = tempfile.mkdtemp()
        audio_path = os.path.join(temp_dir, f"{uuid.uuid4()}.wav")
        audio_file.save(audio_path)
        
        logger.info(f"Audio saved to {audio_path}, analyzing pronunciation")
        
        # Analyze the pronunciation using MFA
        result = analyze_pronunciation(audio_path, expected_text)
        
        # Clean up the temporary files
        try:
            os.remove(audio_path)
            os.rmdir(temp_dir)
        except Exception as e:
            logger.warning(f"Error cleaning up temporary files: {e}")
        
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"Error processing pronunciation analysis: {e}", exc_info=True)
        return jsonify({
            'error': 'Failed to analyze pronunciation',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=int(os.getenv('PORT', 5001)),
        debug=os.getenv('FLASK_ENV', 'production') == 'development'
    ) 