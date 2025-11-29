
# Page Components

The `src/pages/` directory contains the main "view" components for the application. Each subdirectory corresponds to a major feature or section of the site, and its components are responsible for orchestrating the UI for that section.

### Overview

Page components are considered "smart" components. Their primary roles are:

-   Serving as the entry point for a specific URL route.
-   Managing page-specific state.
-   Fetching data from the API by calling functions from the `src/api` directory.
-   Composing smaller, reusable components from `src/components/` to build the final view.

---

### `auth/`

This directory contains all components related to user authentication.

-   **`Login.jsx`:** Renders the login form. It manages form state (email, password), handles form submission by calling the `login` API, manages loading and error states, and redirects the user upon successful authentication.
-   **`Register.jsx`:** Renders the registration form. It handles user input for new account details and calls the `register` API.
-   **`ForgotPassword.jsx`:** Renders a form for users to enter their email to receive a password reset link.
-   **`index.js`:** A barrel file that exports all auth components for cleaner imports elsewhere.

---

### `dashboard/`

This directory contains components for the user's main dashboard.

-   **`DashboardPage.jsx`:** The main container for the dashboard. It fetches all user-related exchanges from the API, calculates stats (active, pending, completed), and organizes the data into sections like "Incoming Requests" and "Active Exchanges".
-   **`DashboardCard.jsx`:** A reusable card component specific to the dashboard, used to display key statistics in a visually appealing way.

---

### `profile/`

This directory handles the viewing and editing of user profiles.

-   **`ProfilePage.jsx`:** Displays the authenticated user's own profile. It fetches data from the `AuthContext` and presents the user's bio, skills, achievements, and other details.
-   **`EditProfile.jsx`:** Renders a form that allows the user to update their profile information, including their name, bio, avatar, and skill sets. It calls the relevant `updateProfile` and `updateUserTopics` API functions.
-   **`PublicProfilePage.jsx`:** Displays a public-facing version of a user's profile. It fetches data based on the `username` URL parameter. The information shown is subject to the user's privacy settings.

---

### `home/`

Components for the application's landing page.

-   **`HomePage.jsx`:** The main component for the `/` route. It primarily composes other sections of the landing page.
-   **`LandingSection.jsx`:** The "hero" section of the homepage, containing the main value proposition, headline, and call-to-action buttons.

---

### `exchange/`

Components related to the knowledge exchange workflow.

-   **`FindMatchesPage.jsx`:** Displays a list of AI-powered potential exchange partners. It handles the logic for fetching matches and sending exchange requests.
-   **`ExchangeDetailsPage.jsx`:** Shows the detailed view of a single exchange, including participants, topics, status, and the real-time chat window. It allows participants to update the exchange status (e.g., accept or complete).