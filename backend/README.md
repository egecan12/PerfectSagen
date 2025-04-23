# Montreal Forced Aligner Backend

This backend service provides an API for interacting with Montreal Forced Aligner (MFA) from the Learn German application.

## Prerequisites

- Python 3.9 or higher
- Conda (for MFA installation)

## Installation

1. Create a conda environment for MFA:
   ```
   conda create -n mfa-env python=3.9
   conda activate mfa-env
   ```

2. Install requirements:
   ```
   pip install -r requirements.txt
   ```

3. Install MFA and its dependencies (this will also install Kaldi):
   ```
   conda install -c conda-forge montreal-forced-aligner
   ```

4. Verify the installation:
   ```
   mfa version
   ```

## Running the API Server

1. Make sure your environment is activated:
   ```
   conda activate mfa-env
   ```

2. Start the API server:
   ```
   python app.py
   ```

The server will start at http://localhost:5000 by default.

## API Endpoints

- `POST /api/analyze_pronunciation`: Analyze the pronunciation of an audio file
  - Request: multipart/form-data with `audio` (file) and `expected_text` (string)
  - Response: JSON with pronunciation analysis results 