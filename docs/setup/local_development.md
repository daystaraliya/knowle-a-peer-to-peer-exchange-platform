
# Local Development Guide

This guide provides step-by-step instructions for setting up and running the Knowle project on your local machine for development purposes.

### Prerequisites

Before you begin, ensure you have the following software installed on your system:

-   **Node.js:** v18.x or later. ([Download](https://nodejs.org/))
-   **npm:** v9.x or later (Comes with Node.js).
-   **Git:** For cloning the repository. ([Download](https://git-scm.com/))
-   **MongoDB:** A running instance of MongoDB. You can use a local installation or a cloud service like MongoDB Atlas. ([MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### Step-by-Step Instructions

**1. Clone the Repository**

Open your terminal and clone the project repository from GitHub.

```bash
git clone https://github.com/your-username/knowle.git
cd knowle
```

**2. Configure Server Environment Variables**

Navigate to the `server` directory, create a `.env` file, and fill it with your configuration details.

```bash
cd server
cp .env.example .env
```

Now, open the newly created `.env` file and add your environment-specific variables.

**`server/.env.example`**

```env
# Server Configuration
PORT=8000
CORS_ORIGIN=http://localhost:3000

# MongoDB Connection
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster-url>/<db-name>?retryWrites=true&w=majority

# JWT Secrets
ACCESS_TOKEN_SECRET=your_super_secret_access_token
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_super_secret_refresh_token
REFRESH_TOKEN_EXPIRY=10d

# Cloudinary Configuration (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Gemini API Key
API_KEY=your_gemini_api_key
```

**3. Install Server Dependencies and Run**

While still in the `server` directory, install the required npm packages and start the development server.

```bash
npm install
npm run dev
```

The server should now be running on `http://localhost:8000`.

**4. Configure Client Environment Variables**

Open a new terminal window, navigate to the `client` directory, and create a `.env` file.

```bash
cd client
cp .env.example .env
```

Open the `client/.env` file and add the necessary variables.

**`client/.env.example`**

```env
# The base URL of your backend server
VITE_API_BASE_URL=http://localhost:8000
```

**5. Install Client Dependencies and Run**

While in the `client` directory, install the npm packages and start the Vite development server.

```bash
npm install
npm run dev
```

The client application should now be running and accessible at `http://localhost:3000`. It will automatically connect to the server running on port 8000.

### Environment Variable Explanations

-   **`PORT`**: The port on which the Node.js server will run.
-   **`CORS_ORIGIN`**: The URL of the client application, required for Cross-Origin Resource Sharing.
-   **`MONGODB_URI`**: The connection string for your MongoDB database.
-   **`ACCESS_TOKEN_SECRET` / `REFRESH_TOKEN_SECRET`**: Secret keys used to sign JWTs for authentication. These should be long, random, and kept private.
-   **`CLOUDINARY_*`**: Credentials for your Cloudinary account, used for storing user avatars and other media.
-   **`API_KEY`**: Your API key for the Google Gemini API, used for AI-powered features.
-   **`VITE_API_BASE_URL`**: The URL that the React client will use to make API requests.