
# Server-Side Architecture

The Knowle server is built with Node.js and the Express.js framework, following a modular and layered architecture. This design promotes separation of concerns, making the API scalable, maintainable, and easy to test.

### Overview

The server's primary responsibility is to provide a RESTful API for the client application. It handles user authentication, business logic, and database interactions. The structure is organized by feature, with a clear and logical flow for handling incoming HTTP requests.

**Request Flow:**

An incoming request from the client follows this path:

1.  **`index.js`**: The main entry point that initializes the Express app, connects to the database, and starts the HTTP server.
2.  **`app.js`**: The central Express application file where all middleware is configured and routes are mounted.
3.  **Middleware:** The request passes through global middleware (CORS, cookie-parser, JSON body parser) and then route-specific middleware (e.g., `authMiddleware` for protected endpoints).
4.  **`src/routes/`**: The request is directed to the appropriate router based on its URL (e.g., `/api/v1/users` is handled by `user.routes.js`).
5.  **`src/controllers/`**: The router calls the corresponding controller function, which contains the core business logic for the request.
6.  **`src/models/`**: The controller interacts with Mongoose models to perform CRUD (Create, Read, Update, Delete) operations on the MongoDB database.
7.  **`src/utils/`**: The controller uses utility functions for tasks like handling asynchronous operations (`asyncHandler`), formatting responses (`ApiResponse`), and managing errors (`ApiError`).
8.  **Response:** The controller sends a structured JSON response back to the client using the `ApiResponse` utility.

### Core Modules

-   **`src/db/index.js`**: Contains the logic for establishing and managing the connection to the MongoDB database using Mongoose.
-   **`src/routes/`**: Defines the API endpoints. Each file (e.g., `user.routes.js`) creates an Express router and maps specific HTTP methods and URL paths to controller functions. It also applies route-specific middleware.
-   **`src/controllers/`**: Holds the business logic. Controllers extract data from the request, perform validation, interact with the database via models, and formulate the final response. They are designed to be independent of the Express `req` and `res` objects by using the `asyncHandler` wrapper.
-   **`src/models/`**: Defines the data structure using Mongoose schemas. Each model file corresponds to a collection in the MongoDB database and includes schema definitions, pre-save hooks (e.g., for password hashing), and instance methods (e.g., for generating JWTs).
-   **`src/utils/`**: A collection of reusable helper modules and classes.
    -   `asyncHandler.js`: A wrapper for Express route handlers to catch errors in asynchronous operations and pass them to the error-handling middleware.
    -   `ApiError.js` & `ApiResponse.js`: Custom classes for standardizing error and success responses across the API.
    -   `cloudinary.js`: A utility for uploading files to the Cloudinary service.
-   **`src/middlewares/`**: Contains custom middleware functions. The most important is `auth.middleware.js`, which validates the user's JWT token from cookies to protect authenticated routes.

### Middleware

Middleware functions are configured in `app.js` and play a crucial role in processing requests.

-   **`cors`**: Manages Cross-Origin Resource Sharing to allow requests from the client's origin.
-   **`cookie-parser`**: Parses `Cookie` header and populates `req.cookies`.
-   **`express.json()`**: Parses incoming requests with JSON payloads.
-   **`express.urlencoded()`**: Parses incoming requests with URL-encoded payloads.
-   **Custom Middleware (`authMiddleware`)**: Applied to specific routes to verify that a user is authenticated before allowing access to the controller logic.