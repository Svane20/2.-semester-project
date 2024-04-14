# Stage 1: Build the Angular application
FROM node:18 AS build

# Set the working directory in the Docker container
WORKDIR /app

# Copy the package.json and install dependencies
COPY package*.json /app/
RUN npm install

# Copy the rest of the application code
COPY . /app

# Build the application
RUN npm run build

# Stage 2: Setup Nginx to serve the Angular application
FROM nginx:alpine

## Remove default Nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy the build output from stage 1
COPY --from=build /app/dist/client/browser /usr/share/nginx/html

# Copy custom Nginx configuration file into the container
COPY ./nginx-custom.conf /etc/nginx/conf.d/default.conf


# Expose port 80
EXPOSE 80

# Start Nginx when the container has provisioned
CMD ["nginx", "-g", "daemon off;"]
