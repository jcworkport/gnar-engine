# Dockerfile for the ephemeral provisioning service
#
# This service is responsible for asserting the databases 
# & database users, or other single runtime provisioning tasks.

FROM node:20-alpine

# Set the working directory
WORKDIR /usr/gnar_engine/app

# Copy package.json and package-lock.json
COPY ./services/provisioner/package*.json ./

# Copy source
COPY ./services/provisioner/src ./src

# Install nodemon
RUN npm install -g nodemon

# Install app dependencies
RUN npm install

# Start the application
CMD ["nodemon", "--watch", "./gnar_engine", "./gnar_engine/app.js"]
