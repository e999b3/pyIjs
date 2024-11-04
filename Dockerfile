# # Use an official Python runtime as a parent image
# FROM python:3.11-slim

# # Set the working directory
# WORKDIR /app

# # Copy the current directory contents into the container at /app
# COPY . /app

# # Install Flask and Flask-SocketIO
# RUN pip install -r requirements.txt

# # Make port 8080 available to the world outside this container
# EXPOSE 8080

# # Run app.py when the container launches
# CMD ["python", "app.py"]

# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Install build tools and Python development headers
RUN apt-get update && apt-get install -y build-essential python3-dev

# Install Node.js
RUN apt-get update && apt-get install -y curl \
    && curl -fsSL https://deb.nodesource.com/setup_14.x | bash - \
    && apt-get install -y nodejs

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install Python dependencies
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Make port 8080 available to the world outside this container
EXPOSE 8080

# Define environment variable
ENV PYTHONUNBUFFERED=1

# Run the application
CMD ["gunicorn", "--worker-class", "eventlet", "-w", "1", "-b", "0.0.0.0:8080", "app:app"]
