
# Production Deployment Guide

This document provides a high-level overview of the steps required to build and deploy the Knowle application to a production environment. The specific commands and configurations may vary depending on your chosen hosting provider.

### Overview

Deploying a full-stack MERN application involves two main parts:

1.  **Deploying the Node.js/Express Backend:** The server needs to run in a Node.js environment with access to a production database and all necessary environment variables.
2.  **Building and Deploying the React Frontend:** The client application needs to be built into static files (HTML, CSS, JS) and served by a static hosting service or a web server.

### Build Process

**Client Application**

Before deploying the client, you need to create a production-ready build. Navigate to the `client` directory and run the build script:

```bash
cd client
npm run build
```

This command will create a `dist` directory in the `client` folder. This directory contains the optimized, minified static assets that should be deployed.

**Server Application**

The server does not have a traditional "build" step like the client. You will deploy the source code directly to your production environment, which will then run it using Node.js.

### Deployment Steps (Example: Google Cloud Run)

Here is a conceptual guide for deploying to a platform like Google Cloud Run, which is suitable for containerized applications.

**1. Containerize the Application**

-   Create a `Dockerfile` for the server application. This file will define the steps to create a Docker image containing your Node.js application and its dependencies.
-   Create a separate `Dockerfile` for the client. This one can use a multi-stage build: one stage to build the static assets with `npm run build`, and a final, lightweight stage (e.g., using `nginx`) to serve the contents of the `dist` folder.

**2. Set Up a Production Database**

-   Use a managed database service like **MongoDB Atlas**.
-   Create a new cluster for your production environment.
-   Ensure you configure firewall rules to allow connections from your deployment service.
-   Obtain the production database connection string (`MONGODB_URI`).

**3. Configure Environment Variables**

-   In your hosting provider's dashboard (e.g., Google Cloud Run service settings), securely store all the environment variables defined in your `server/.env` and `client/.env` files.
-   **Crucially, do not commit your `.env` files to version control.**
-   For the client, `VITE_API_BASE_URL` should be set to the public URL of your deployed backend service.
-   For the server, `CORS_ORIGIN` should be set to the public URL of your deployed frontend service.

**4. Build and Push Docker Images**

-   Use a container registry service like Google Container Registry (GCR) or Docker Hub.
-   Build your client and server Docker images.
-   Push the images to your container registry.

```bash
# Example commands
docker build -t gcr.io/your-project/knowle-server ./server
docker push gcr.io/your-project/knowle-server

docker build -t gcr.io/your-project/knowle-client ./client
docker push gcr.io/your-project/knowle-client
```

**5. Deploy to Cloud Run**

-   Create two new services in Cloud Run: one for the server and one for the client.
-   When creating each service, select the corresponding container image you pushed to the registry.
-   Configure the environment variables you set up in step 3.
-   Expose the appropriate ports (e.g., port 80 for the client, port 8000 for the server).
-   Deploy the services.

Once deployed, you will have public URLs for both your frontend and backend, and the application will be live.