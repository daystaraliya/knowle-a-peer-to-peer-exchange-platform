
# Contribution Guidelines

Thank you for your interest in contributing to Knowle! We welcome contributions from the community to help us improve and grow the platform. Please take a moment to review these guidelines to ensure a smooth and effective contribution process.

### Code of Conduct

We are committed to fostering an open, welcoming, and inclusive community. All contributors are expected to adhere to our Code of Conduct. Please be respectful and considerate in all your interactions. Harassment or exclusionary behavior will not be tolerated.

### Getting Started

Before you start, please make sure you have set up the project locally. For detailed instructions, refer to the [Local Development Guide](./setup/local_development.md).

### Contribution Workflow

We follow a standard Git workflow based on feature branches and pull requests.

1.  **Fork the Repository:** Start by forking the main repository to your own GitHub account.
2.  **Create a Feature Branch:** For any new feature or bug fix, create a new branch from the `main` branch.
    -   Use a descriptive branch name, such as `feat/user-profile-cache` or `fix/login-button-bug`.
    ```bash
    git checkout -b feat/your-feature-name
    ```
3.  **Make Your Changes:** Implement your feature or bug fix. Write clean, readable, and well-commented code.
4.  **Commit Your Changes:** Make small, logical commits with clear and concise commit messages.
    ```bash
    git commit -m "feat: Add caching to user profile endpoint"
    ```
5.  **Push to Your Fork:** Push your feature branch to your forked repository.
    ```bash
    git push origin feat/your-feature-name
    ```
6.  **Open a Pull Request (PR):**
    -   Navigate to the main Knowle repository and you should see a prompt to create a PR from your new branch.
    -   Provide a clear title and a detailed description of the changes you've made. If your PR addresses an existing issue, link to it (e.g., "Closes #42").
    -   Your PR will be reviewed by the maintainers. Be prepared to address any feedback or requested changes.

### Coding Standards

To maintain code quality and consistency, we use ESLint for linting.

-   **Linting:** Before committing your code, please run the linter to catch any potential issues. The linter is configured for both the client and server.
    ```bash
    # In the client directory
    cd client
    npm run lint

    # In the server directory (ESLint is often run by the editor or via a pre-commit hook)
    ```
-   **Code Style:** We follow standard JavaScript and React conventions. Please try to match the style of the existing codebase.

### Reporting Issues

If you find a bug or have a feature request, please create an issue on the GitHub repository.

-   **Search Existing Issues:** Before creating a new issue, please check if a similar one already exists.
-   **Provide Detailed Information:**
    -   For **bug reports**, include steps to reproduce the bug, the expected behavior, the actual behavior, and any relevant screenshots or error messages.
    -   For **feature requests**, clearly describe the problem you're trying to solve and your proposed solution. Explain why this feature would be valuable to the community.