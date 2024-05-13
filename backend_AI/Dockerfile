# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /usr/src/

# Copy the current directory contents into the container
COPY ./src/requirements.txt /usr/src

# Install any needed dependencies specified in requirements.txt
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt
# RUN apt-get update && apt-get install ffmpeg libsm6 libxext6  -y
RUN apt-get update && apt-get -y install libgl1
# RUN apt-get install libglib2.0-dev
RUN apt-get install -y libglib2.0-dev

# Copy the working directory over
COPY ./src /usr/src/

# Make port 5000 available to the world outside this container
EXPOSE 5000

# Run app.py when the container launches
CMD ["python", "app.py"]
