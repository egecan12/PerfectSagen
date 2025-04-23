# Learn German

A Next.js application for learning German pronunciation with pronunciation evaluation.

## Features

- Learn German vocabulary with correct pronunciation
- Record your voice and get feedback on your pronunciation
- Two modes of pronunciation analysis:
  - Simple analysis using local string comparison algorithms
  - Advanced analysis using Montreal Forced Aligner (MFA)
- View detailed metrics on phonetic accuracy, rhythm, and stress

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- For MFA backend:
  - Conda (Miniconda or Anaconda)
  - Python 3.9+

### Frontend Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env.local` file with the following environment variables:
   ```
   NEXT_PUBLIC_OPENAI_API_KEY=your_openai_key_here
   NEXT_PUBLIC_MFA_BACKEND_URL=http://localhost:5000
   ```

3. Run the development server:
   ```
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Montreal Forced Aligner Backend Setup

The application can use Montreal Forced Aligner for more accurate pronunciation analysis. To set up the MFA backend:

#### Option 1: Using the install script (Recommended)

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Run the installation and start script:
   ```
   ./install_and_run.sh
   ```

This script will:
- Create a conda environment
- Install MFA and dependencies
- Download necessary models
- Start the Flask server

#### Option 2: Manual Setup

1. Create a conda environment:
   ```
   conda create -n mfa-env python=3.9
   conda activate mfa-env
   ```

2. Install MFA:
   ```
   conda install -c conda-forge montreal-forced-aligner
   ```

3. Install backend dependencies:
   ```
   cd backend
   pip install -r requirements.txt
   ```

4. Start the Flask server:
   ```
   python app.py
   ```

#### Option 3: Using Docker (for advanced users)

1. Build and start the Docker container:
   ```
   cd backend
   docker-compose up -d
   ```

### Usage

1. Click on "Using Simple Analysis" to toggle between simple analysis and MFA.
2. Select a vocabulary level (A1, A2).
3. Click the microphone button to start recording.
4. Pronounce the German word or sentence.
5. Click the stop button when finished.
6. View your pronunciation analysis results.

## Project Structure

- `app/` - Next.js application files
  - `components/` - React components
  - `hooks/` - Custom React hooks for pronunciation
  - `services/` - Services for transcription and analysis
  - `utils/` - Utility functions
  - `data/` - Vocabulary data
- `backend/` - MFA backend
  - `app.py` - Flask application
  - `mfa_service.py` - MFA integration service

## Technologies Used

- **Frontend**:
  - Next.js 15
  - React 19
  - TailwindCSS 4
  - Xenova Transformers.js for local speech recognition
  - OpenAI Whisper API for transcription
  
- **Backend**:
  - Flask
  - Montreal Forced Aligner (MFA)
  - Kaldi (included with MFA)

## License

This project is licensed under the MIT License.
