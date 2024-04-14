# Stage 1: Building the application
FROM node:lts as builder

# Set the working directory in the Docker container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json for installing dependencies
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of your application's source code
COPY . .

# Build your NestJS application
RUN npm run build

# Stage 2: Setting up the production environment
FROM node:lts as production

# Set NODE_ENV environment variable
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

# Copy package.json and package-lock.json for installing production dependencies
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy the built artifacts from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Your application listens on port 3000 by default but change this if necessary
EXPOSE 3000

# Command to run your app using the `node` command instead of `npm start`
CMD ["node", "dist/main"]
