FROM continuumio/miniconda3:latest

WORKDIR /app

# Create conda environment
RUN conda create -n mfa-env python=3.9 -y && \
    echo "source activate mfa-env" > ~/.bashrc

# Install MFA from conda-forge
RUN /opt/conda/bin/conda install -n mfa-env -c conda-forge montreal-forced-aligner -y

# Copy requirements first for better caching
COPY requirements.txt .
RUN /opt/conda/envs/mfa-env/bin/pip install -r requirements.txt

# Copy application files
COPY . .

# Create necessary directories
RUN mkdir -p dictionaries models temp uploads

# Make the entry point script executable
RUN chmod +x entrypoint.sh

# Expose the port
EXPOSE 5000

# Entry point script will activate conda env and run Flask
ENTRYPOINT ["./entrypoint.sh"] 