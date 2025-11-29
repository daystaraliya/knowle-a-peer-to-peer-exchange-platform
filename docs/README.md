
# Knowle

Knowle is a full-stack web application designed to facilitate knowledge exchange among users. It provides a platform where individuals can connect to both teach skills they are proficient in and learn new skills from others, fostering a collaborative and educational community. The application features a modern, intuitive user interface and a robust, scalable backend to support real-time interactions and data management.

### Features

-   **User Authentication:** Secure registration and login system with JWT-based session management.
-   **Profile Management:** Customizable user profiles with bios, skills, and achievements.
-   **AI-Powered Matchmaking:** Intelligent system to connect users with compatible learning and teaching interests.
-   **Knowledge Exchange:** A structured process for users to initiate, accept, and complete knowledge-sharing sessions.
-   **Real-time Chat:** Integrated chat functionality for seamless communication between exchange partners.
-   **Dashboard:** Personalized user dashboard to track active, pending, and completed exchanges.
-   **Gamification:** Points and achievements system to incentivize user participation.
-   **Community Features:** Includes forums, skill trees, and a leaderboard to enhance engagement.

### Tech Stack

**Client-Side (React)**

-   **Vite:** A next-generation frontend build tool for a faster and leaner development experience.
-   **React:** A JavaScript library for building user interfaces with a component-based architecture.
-   **React Router:** For declarative routing and navigation within the single-page application.
-   **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
-   **Axios:** A promise-based HTTP client for making API requests to the server.
-   **Context API:** For managing global state like user authentication.

**Server-Side (Node.js/Express)**

-   **Node.js:** A JavaScript runtime for building fast and scalable server-side applications.
-   **Express.js:** A minimal and flexible Node.js web application framework.
-   **MongoDB:** A NoSQL database for storing application data.
-   **Mongoose:** An Object Data Modeling (ODM) library for MongoDB and Node.js.
-   **JSON Web Tokens (JWT):** For implementing a secure and stateless authentication mechanism.
-   **Cloudinary:** For cloud-based image and media management.
-   **Socket.IO:** For enabling real-time, bidirectional event-based communication.

### Getting Started

For detailed instructions on how to set up and run the project locally, please refer to the [Local Development Guide](./setup/local_development.md).

### Quick Start

```bash
# 1. Clone the repository
git clone <repository-url>
cd Knowle

# 2. Setup and run the server
cd server
cp .env.example .env
# Fill in your .env variables
npm install
npm run dev

# 3. Setup and run the client
cd ../client
cp .env.example .env
# Fill in your .env variables
npm install
npm run dev
```