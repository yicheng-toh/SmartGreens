# Use an official Node.js runtime as a base image
FROM node:18.18.0-alpine

# Set the working directory in the container
WORKDIR /usr/src/

# Copy package.json and package-lock.json to the working directory
COPY package*.json /usr/src/

# Install app dependencies
RUN npm install

# Bundle your app source
COPY ./src /usr/src/

# Expose port 3000
EXPOSE 3000

# Define the command to run your app
# CMD ["npm", "run", "docker1"]
CMD ["npm", "run", "docker_azure_documentation"]
