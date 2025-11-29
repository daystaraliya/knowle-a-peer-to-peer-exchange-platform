
# User API Endpoints

The User API provides endpoints for user registration, authentication, profile management, and other user-specific actions.

---

### POST /api/v1/users/register

Registers a new user account.

-   **Method:** `POST`
-   **URL:** `/api/v1/users/register`
-   **Authentication:** None
-   **Request Body:**

    ```json
    {
      "fullName": "John Doe",
      "username": "johndoe",
      "email": "john.doe@example.com",
      "password": "Password123!"
    }
    ```

-   **Success Response (201):**

    ```json
    {
      "statusCode": 201,
      "data": {
        "_id": "60d0fe4f5b3a3d001f8e4e2a",
        "fullName": "John Doe",
        "username": "johndoe",
        "email": "john.doe@example.com",
        "avatar": null,
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-01T00:00:00.000Z"
      },
      "message": "User registered successfully",
      "success": true
    }
    ```

-   **Error Response (409):** User with email or username already exists.

    ```json
    {
      "statusCode": 409,
      "message": "User with this email or username already exists.",
      "success": false
    }
    ```

---

### POST /api/v1/users/login

Logs in a user and returns JWT tokens in `httpOnly` cookies.

-   **Method:** `POST`
-   **URL:** `/api/v1/users/login`
-   **Authentication:** None
-   **Request Body:**

    ```json
    {
      "email": "john.doe@example.com",
      "password": "Password123!"
    }
    ```

-   **Success Response (200):** Sets `accessToken` and `refreshToken` cookies.

    ```json
    {
      "statusCode": 200,
      "data": {
        "user": {
          "_id": "60d0fe4f5b3a3d001f8e4e2a",
          "fullName": "John Doe",
          "email": "john.doe@example.com",
          "topicsToTeach": [],
          "topicsToLearn": []
        }
      },
      "message": "User logged In successfully",
      "success": true
    }
    ```

-   **Error Response (404):** Invalid credentials.

    ```json
    {
      "statusCode": 404,
      "message": "Invalid user credentials",
      "success": false
    }
    ```

---

### POST /api/v1/users/logout

Logs out the current user by clearing their refresh token and cookies.

-   **Method:** `POST`
-   **URL:** `/api/v1/users/logout`
-   **Authentication:** Requires valid JWT token in cookie.
-   **Request Body:** None
-   **Success Response (200):**

    ```json
    {
      "statusCode": 200,
      "data": {},
      "message": "User logged out successfully",
      "success": true
    }
    ```

---

### GET /api/v1/users/profile

Fetches the profile of the currently authenticated user.

-   **Method:** `GET`
-   **URL:** `/api/v1/users/profile`
-   **Authentication:** Requires valid JWT token in cookie.
-   **Request Body:** None
-   **Success Response (200):**

    ```json
    {
      "statusCode": 200,
      "data": {
        "_id": "60d0fe4f5b3a3d001f8e4e2a",
        "fullName": "John Doe",
        "email": "john.doe@example.com",
        "topicsToTeach": [{ "_id": "...", "name": "React" }],
        "topicsToLearn": [{ "_id": "...", "name": "Node.js" }]
      },
      "message": "User profile fetched successfully",
      "success": true
    }
    ```

---

### PATCH /api/v1/users/profile

Updates the profile details of the currently authenticated user.

-   **Method:** `PATCH`
-   **URL:** `/api/v1/users/profile`
-   **Authentication:** Requires valid JWT token in cookie.
-   **Request Body:**

    ```json
    {
      "fullName": "Johnathan Doe",
      "bio": "A passionate full-stack developer."
    }
    ```

-   **Success Response (200):**

    ```json
    {
      "statusCode": 200,
      "data": {
        "_id": "60d0fe4f5b3a3d001f8e4e2a",
        "fullName": "Johnathan Doe",
        "bio": "A passionate full-stack developer."
      },
      "message": "Account details updated successfully",
      "success": true
    }
    ```

---

### PATCH /api/v1/users/avatar

Updates the avatar of the currently authenticated user.

-   **Method:** `PATCH`
-   **URL:** `/api/v1/users/avatar`
-   **Authentication:** Requires valid JWT token in cookie.
-   **Request Body:** `multipart/form-data` with a single file field named `avatar`.

---

### PATCH /api/v1/users/topics

Updates the topics a user wants to teach and learn.

-   **Method:** `PATCH`
-   **URL:** `/api/v1/users/topics`
-   **Authentication:** Requires valid JWT token in cookie.
-   **Request Body:**

    ```json
    {
      "topicsToTeach": ["topicId1", "topicId2"],
      "topicsToLearn": ["topicId3"]
    }
    ```