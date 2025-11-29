
# Client-Side Architecture

The Knowle client is a modern single-page application (SPA) built with React and Vite. Its architecture is designed to be modular, scalable, and easy to maintain, following best practices for React development.

### Overview

The client-side is structured to separate concerns, making the codebase predictable and developer-friendly. The core idea is to have "smart" page components that compose "dumb" reusable components. Data fetching and state management are handled at higher levels, allowing UI components to focus solely on presentation.

-   **`src/pages`**: This directory contains the top-level components for each view or "page" of the application (e.g., HomePage, LoginPage, DashboardPage). These components are responsible for fetching data from the API and managing page-specific state.
-   **`src/components`**: This directory houses reusable UI components like `Button.jsx`, `Header.jsx`, and `Footer.jsx`. These components receive data via props and are designed to be application-agnostic.
-   **`src/api`**: API calls are centralized here, abstracting the data-fetching logic from the components. It uses an Axios client instance for consistent request handling.
-   **`src/context`**: Global state management is handled here, primarily using React's Context API.

### Component Hierarchy

The application's component tree originates from `main.jsx`, which renders the `App.jsx` component. `App.jsx` serves as the root of the application's UI, setting up the main layout and routing.

A simplified hierarchy looks like this:

```
- main.jsx
  - BrowserRouter
    - AuthProvider (Context)
      - App.jsx
        - Header.jsx
        - <main>
          - Routes
            - Route (path="/") -> HomePage.jsx
              - LandingSection.jsx
            - Route (path="/login") -> Login.jsx
            - Route (path="/dashboard") -> DashboardPage.jsx
              - DashboardCard.jsx
        - Footer.jsx
```

### State Management

Global state, specifically user authentication status, is managed using the `AuthContext`.

**`src/context/AuthContext.jsx`**

-   **Purpose:** To provide a global `user` object and authentication-related functions (`login`, `logout`, `refetchUser`) to any component in the application.
-   **Mechanism:**
    1.  The `AuthProvider` component wraps the entire application in `main.jsx`.
    2.  It uses a `useState` hook to store the `user` object.
    3.  An `useEffect` hook runs on mount to call the `/api/v1/users/profile` endpoint, verifying the user's session via the `httpOnly` cookie and populating the user state.
    4.  The `login` function updates the user state upon successful login, while `logout` clears it.
    5.  Any child component can access this context using the `useContext(AuthContext)` hook.

This approach avoids "prop drilling" and keeps authentication logic centralized and decoupled from the UI components.

### Routing

Client-side routing is managed by the `react-router-dom` library. The routes are defined declaratively within the `App.jsx` component.

-   **`BrowserRouter`**: Wraps the application in `main.jsx` to enable HTML5 history API-based routing.
-   **`Routes` and `Route`**: Used inside `App.jsx` to map URL paths to their corresponding page components.
-   **`Link` and `NavLink`**: Used throughout the application (e.g., in `Header.jsx`) for declarative navigation, preventing full-page reloads. `NavLink` provides styling hooks for active links.
-   **`useNavigate`**: A hook used for programmatic navigation, such as redirecting a user after a successful login.
-   **`useParams`**: A hook used to access URL parameters, for instance, to fetch details for a specific exchange using its ID (`/exchange/:id`).