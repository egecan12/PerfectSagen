#!/bin/bash

# Exit on error
set -e

# Display commands being executed
set -x

# Check if conda is installed
if ! command -v conda &> /dev/null; then
    echo "Conda is not installed. Please install Miniconda or Anaconda first."
    echo "Visit https://docs.conda.io/en/latest/miniconda.html for installation instructions."
    exit 1
fi

# Define environment name
ENV_NAME="mfa-env"

# Check if the environment already exists
if conda env list | grep -q "$ENV_NAME"; then
    echo "Environment $ENV_NAME already exists."
else
    echo "Creating conda environment: $ENV_NAME"
    conda create -n "$ENV_NAME" python=3.9 -y
fi

# Activate the environment and install dependencies
echo "Installing dependencies..."
conda activate "$ENV_NAME" || source activate "$ENV_NAME"

# Install MFA from conda-forge
conda install -c conda-forge montreal-forced-aligner -y

# Install Python requirements
pip install -r requirements.txt

# Check MFA installation
echo "Verifying MFA installation..."
mfa version

# Create necessary directories
mkdir -p dictionaries models temp uploads

# Download resources
echo "Downloading MFA resources (this may take a while)..."
# Download German acoustic model if not already downloaded
if mfa model list --acoustic | grep -i "german"; then
    echo "German acoustic model already downloaded."
else
    mfa model download acoustic german_mfa
fi

# Start the server
echo "Starting MFA backend server..."
python app.py 