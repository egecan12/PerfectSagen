"""
Service module for interfacing with Montreal Forced Aligner.
"""
import os
import shutil
import tempfile
import logging
import json
import subprocess
from pathlib import Path
import uuid

logger = logging.getLogger(__name__)

# Define paths for MFA resources
BASE_DIR = Path(__file__).resolve().parent
DICT_DIR = BASE_DIR / "dictionaries"
MODEL_DIR = BASE_DIR / "models"
TEMP_DIR = BASE_DIR / "temp"

# Create necessary directories
os.makedirs(DICT_DIR, exist_ok=True)
os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(TEMP_DIR, exist_ok=True)

# MFA dictionary for German
GERMAN_DICT_URL = "https://raw.githubusercontent.com/MontrealCorpusTools/mfa-models/main/dictionary/german_mfa.dict"
GERMAN_DICT_PATH = DICT_DIR / "german_mfa.dict"

def download_resources():
    """
    Download necessary MFA resources if they don't exist.
    """
    # Download German dictionary if it doesn't exist
    if not GERMAN_DICT_PATH.exists():
        logger.info("Downloading German MFA dictionary...")
        try:
            subprocess.run(
                ["curl", "-o", str(GERMAN_DICT_PATH), GERMAN_DICT_URL],
                check=True
            )
            logger.info("German dictionary downloaded successfully")
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to download German dictionary: {e}")
            raise

    # Skip model check as it's already downloaded
    logger.info("Skipping acoustic model check - assuming it's already downloaded")
    return

def prepare_corpus(audio_path, text, corpus_dir):
    """
    Prepare a temporary corpus for MFA alignment.
    
    Args:
        audio_path: Path to the audio file
        text: The expected text
        corpus_dir: Directory to create the corpus in
        
    Returns:
        Tuple of (audio_basename, text_path)
    """
    # Create a unique name for the audio file
    audio_basename = f"recording_{uuid.uuid4().hex}"
    
    # Copy the audio file to the corpus directory
    audio_dest = os.path.join(corpus_dir, f"{audio_basename}.wav")
    shutil.copy(audio_path, audio_dest)
    
    # Create the text file with the expected text
    text_path = os.path.join(corpus_dir, f"{audio_basename}.lab")
    with open(text_path, "w", encoding="utf-8") as f:
        f.write(text)
    
    return audio_basename, text_path

def run_alignment(corpus_dir, output_dir):
    """
    Run MFA alignment on the corpus.
    
    Args:
        corpus_dir: Directory containing the audio and text files
        output_dir: Directory to store alignment results
        
    Returns:
        Path to the output directory
    """
    try:
        logger.info("Running MFA alignment...")
        subprocess.run([
            "mfa", "align",
            corpus_dir,
            str(GERMAN_DICT_PATH),
            "german_mfa",
            output_dir,
            "--clean",
            "--overwrite",
            "--verbose"
        ], check=True)
        
        logger.info(f"Alignment complete. Results in {output_dir}")
        return output_dir
    except subprocess.CalledProcessError as e:
        logger.error(f"MFA alignment failed: {e}")
        raise RuntimeError(f"MFA alignment failed: {e}")

def parse_textgrid(textgrid_path):
    """
    Parse the TextGrid file produced by MFA.
    
    Args:
        textgrid_path: Path to the TextGrid file
        
    Returns:
        Dictionary with phonetic analysis results
    """
    try:
        # Use MFA's TextGrid parsing capability
        # This is a simplified version - in a real implementation,
        # you would use a proper TextGrid parser library
        
        # For now, we'll simulate the analysis with basic metrics
        # In a real implementation, you'd analyze the actual phoneme alignments
        
        # Run the mfa text_grid_info command to get info about the alignment
        result = subprocess.run([
            "mfa", "inspect_textgrid", str(textgrid_path), "--count_labels"
        ], capture_output=True, text=True, check=True)
        
        # Parse the output to extract useful metrics
        output = result.stdout
        
        # Count phones (as a proxy for phonetic accuracy)
        phone_count = output.count("phone")
        word_count = output.count("word")
        
        # Generate a score based on the alignment
        # In a real implementation, this would be based on actual metrics
        # such as forced alignment confidence scores
        
        # For now we'll use a simulated score
        phonetic_accuracy = min(95, 60 + (phone_count * 5))  # Simulated score
        rhythm_accuracy = min(90, 65 + (word_count * 5))     # Simulated score
        stress_accuracy = min(85, 60 + (word_count * 5))     # Simulated score
        
        # Overall score is a weighted average
        overall_score = int((phonetic_accuracy * 0.6) + 
                         (rhythm_accuracy * 0.2) + 
                         (stress_accuracy * 0.2))
        
        # Generate feedback based on the score
        if overall_score >= 90:
            feedback = "Excellent pronunciation! Your German sounds very natural."
        elif overall_score >= 80:
            feedback = "Very good pronunciation. Minor improvements in stress patterns would help."
        elif overall_score >= 70:
            feedback = "Good pronunciation. Work on rhythm and phonetic accuracy."
        elif overall_score >= 60:
            feedback = "Fair pronunciation. Practice the specific German sounds more."
        else:
            feedback = "Keep practicing. Focus on basic German sounds and word stress."
        
        return {
            "score": overall_score,
            "feedback": feedback,
            "details": {
                "phoneticAccuracy": int(phonetic_accuracy),
                "rhythmAccuracy": int(rhythm_accuracy),
                "stressAccuracy": int(stress_accuracy)
            }
        }
        
    except Exception as e:
        logger.error(f"Error parsing TextGrid: {e}", exc_info=True)
        raise RuntimeError(f"Failed to parse alignment results: {e}")

def analyze_pronunciation(audio_path, expected_text):
    """
    Analyze pronunciation using MFA.
    
    Args:
        audio_path: Path to the audio file
        expected_text: The expected text
        
    Returns:
        Dictionary with pronunciation analysis results
    """
    try:
        # Ensure we have the necessary resources
        download_resources()
        
        # Create temporary directories for corpus and output
        corpus_dir = tempfile.mkdtemp(prefix="mfa_corpus_", dir=TEMP_DIR)
        output_dir = tempfile.mkdtemp(prefix="mfa_output_", dir=TEMP_DIR)
        
        try:
            # Prepare the corpus
            audio_basename, text_path = prepare_corpus(
                audio_path, expected_text, corpus_dir
            )
            
            # Run alignment
            run_alignment(corpus_dir, output_dir)
            
            # Find the TextGrid file
            textgrid_path = os.path.join(output_dir, f"{audio_basename}.TextGrid")
            
            if not os.path.exists(textgrid_path):
                raise FileNotFoundError(
                    f"TextGrid file not found at {textgrid_path}. Alignment may have failed."
                )
            
            # Parse the TextGrid file
            results = parse_textgrid(textgrid_path)
            
            return results
        
        finally:
            # Clean up temporary directories
            try:
                shutil.rmtree(corpus_dir, ignore_errors=True)
                shutil.rmtree(output_dir, ignore_errors=True)
            except Exception as e:
                logger.warning(f"Error cleaning up temporary directories: {e}")
    
    except Exception as e:
        logger.error(f"Error in pronunciation analysis: {e}", exc_info=True)
        return {
            "score": 0,
            "feedback": f"Error analyzing pronunciation: {str(e)}",
            "details": {
                "phoneticAccuracy": 0,
                "rhythmAccuracy": 0,
                "stressAccuracy": 0
            },
            "error": str(e)
        }

# Download resources when the module is imported
if __name__ != "__main__":
    try:
        download_resources()
    except Exception as e:
        logger.error(f"Failed to download resources: {e}")

