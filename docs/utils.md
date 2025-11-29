
# Utility Functions

The `server/src/utils/` directory contains a set of helper functions and classes that provide reusable logic across the application. These utilities help keep the controller logic clean and enforce consistent patterns for error handling, API responses, and external service interactions.

---

### `ApiError.js`

-   **Purpose:** A custom error class that extends the built-in `Error` class. It is used to create standardized, operational errors that can be easily sent back to the client in a JSON format.
-   **Implementation:** The constructor accepts a `statusCode`, `message`, an array of `errors`, and an optional `stack` trace. It sets a `success: false` flag, which is consistent with the API response structure.
-   **Usage:** Thrown from within controllers or services when a request cannot be fulfilled due to a client or server error.

    ```javascript
    // In a controller
    import { ApiError } from "../utils/ApiError.js";

    if (!username || !email) {
        throw new ApiError(400, "Username and email are required");
    }
    ```

---

### `ApiResponse.js`

-   **Purpose:** A custom class for creating standardized success responses. It ensures that all successful API responses follow a consistent JSON structure.
-   **Implementation:** The constructor accepts a `statusCode`, the `data` payload, and a `message`. It automatically determines the `success` boolean based on the status code.
-   **Usage:** Used at the end of a successful controller function to send the response back to the client.

    ```javascript
    // In a controller
    import { ApiResponse } from "../utils/ApiResponse.js";

    return res.status(200).json(
        new ApiResponse(200, user, "User logged in successfully")
    );
    ```

---

### `asyncHandler.js`

-   **Purpose:** A higher-order function that wraps asynchronous Express route handlers. It removes the need for repetitive `try...catch` blocks within controllers.
-   **Implementation:** It takes a controller function as an argument and returns a new function. Inside, it calls the original controller function and chains a `.catch(next)` to it. This ensures that any rejected promise (error) is automatically passed to Express's next error-handling middleware.
-   **Usage:** Used to wrap every controller function when it is attached to a route.

    ```javascript
    // In user.routes.js
    import { asyncHandler } from "../utils/asyncHandler.js";
    import { registerUser } from "../controllers/user.controllers.js";

    router.route("/register").post(asyncHandler(registerUser));
    ```

---

### `cloudinary.js`

-   **Purpose:** A utility function to handle file uploads to the Cloudinary service.
-   **Implementation:** It configures the Cloudinary SDK with credentials from environment variables. The `uploadOnCloudinary` function takes a local file path, uploads the file to Cloudinary, and then deletes the temporary local file to clean up the server's file system.
-   **Usage:** Called from controllers that handle file uploads, such as updating a user's avatar.

    ```javascript
    // In user.controllers.js
    import { uploadOnCloudinary } from "../utils/cloudinary.js";

    const avatarLocalPath = req.file?.path;
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    // ... update user model with avatar.url
    ```

---

### `mailSender.js`

-   **Purpose:** A utility for sending emails using Nodemailer.
-   **Implementation:** It configures a Nodemailer transporter with SMTP credentials from environment variables. The `mailSender` function takes an email address, title, and body, and sends the email.
-   **Usage:** Used for features like sending password reset links.

---

### `validation.js`

-   **Purpose:** A collection of simple validation helper functions.
-   **Implementation:** Contains functions like `isValidEmail` and `isValidPassword` that use regular expressions to check if strings match required formats. It also includes a basic `sanitizeHTML` function to prevent XSS.
-   **Usage:** Called in controllers to validate user input before processing it.