
# Exchange API Endpoints

The Exchange API manages the process of finding matches and facilitating knowledge exchanges between users. All endpoints require authentication.

---

### GET /api/v1/exchanges/matches

Finds potential knowledge exchange partners for the authenticated user, ranked by an AI.

-   **Method:** `GET`
-   **URL:** `/api/v1/exchanges/matches`
-   **Authentication:** Requires valid JWT token in cookie.
-   **Query Parameters:**
    -   `language` (optional, string): Filters matches by a spoken language (e.g., `?language=English`).
-   **Request Body:** None
-   **Success Response (200):**

    ```json
    {
      "statusCode": 200,
      "data": [
        {
          "_id": "60d0fe4f5b3a3d001f8e4e2b",
          "fullName": "Jane Smith",
          "username": "janesmith",
          "avatar": "https://...",
          "matchReason": "Jane is an expert in React, which you want to learn, and is eager to learn about Node.js from you.",
          "topicsToTeach": [{ "_id": "...", "name": "React" }],
          "topicsToLearn": [{ "_id": "...", "name": "Node.js" }]
        }
      ],
      "message": "AI-powered matches retrieved successfully",
      "success": true
    }
    ```

---

### POST /api/v1/exchanges

Creates a new exchange request to another user.

-   **Method:** `POST`
-   **URL:** `/api/v1/exchanges`
-   **Authentication:** Requires valid JWT token in cookie.
-   **Request Body:**

    ```json
    {
      "receiverId": "60d0fe4f5b3a3d001f8e4e2b",
      "topicToLearnId": "...",
      "topicToTeachId": "..."
    }
    ```

-   **Success Response (201):**

    ```json
    {
      "statusCode": 201,
      "data": {
        "_id": "60d0fe4f5b3a3d001f8e4e2c",
        "initiator": "currentUserId",
        "receiver": "60d0fe4f5b3a3d001f8e4e2b",
        "status": "pending",
        "...": "..."
      },
      "message": "Exchange request sent successfully.",
      "success": true
    }
    ```

-   **Error Response (409):** If an active or pending request with this user already exists.

---

### GET /api/v1/exchanges/:exchangeId

Retrieves the details of a specific exchange. The user must be a participant.

-   **Method:** `GET`
-   **URL:** `/api/v1/exchanges/:exchangeId`
-   **Authentication:** Requires valid JWT token in cookie.
-   **Request Body:** None
-   **Success Response (200):**

    ```json
    {
      "statusCode": 200,
      "data": {
        "_id": "60d0fe4f5b3a3d001f8e4e2c",
        "status": "accepted",
        "initiator": { "fullName": "John Doe", "..." },
        "receiver": { "fullName": "Jane Smith", "..." },
        "topicToLearn": { "name": "React" },
        "topicToTeach": { "name": "Node.js" }
      },
      "message": "Exchange details retrieved successfully",
      "success": true
    }
    ```

---

### PATCH /api/v1/exchanges/:exchangeId/status

Updates the status of an exchange (e.g., accept, reject, complete).

-   **Method:** `PATCH`
-   **URL:** `/api/v1/exchanges/:exchangeId/status`
-   **Authentication:** Requires valid JWT token in cookie.
-   **Request Body:**

    ```json
    {
      "status": "accepted"
    }
    ```

-   **Success Response (200):**

    ```json
    {
      "statusCode": 200,
      "data": {
        "_id": "60d0fe4f5b3a3d001f8e4e2c",
        "status": "accepted",
        "..." : "..."
      },
      "message": "Exchange has been accepted.",
      "success": true
    }
    ```

---

### POST /api/v1/exchanges/:exchangeId/review

Submits a rating and review for a completed exchange.

-   **Method:** `POST`
-   **URL:** `/api/v1/exchanges/:exchangeId/review`
-   **Authentication:** Requires valid JWT token in cookie.
-   **Request Body:**

    ```json
    {
      "rating": 5,
      "review": "Jane was an excellent teacher. Very clear and patient."
    }
    ```

-   **Success Response (200):**

    ```json
    {
      "statusCode": 200,
      "data": { "...updated exchange object..." },
      "message": "Review submitted successfully.",
      "success": true
    }
    ```