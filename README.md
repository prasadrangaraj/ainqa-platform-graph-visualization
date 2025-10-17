# EBM AI Assistant

## Project Description
EBM AI Assistant is a clinical decision support system that provides AI-powered Evidence-Based Medicine (EBM) recommendations directly within physician workflows during active patient encounters. It's built on top of Vite, React, and MUI library.

## Setup

### Prerequisites
- Node.js (v20)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository_url>
   ```
2. Install dependencies:
   ```bash
   npm install
   # or yarn install
   ```

## Available Scripts

In the project directory, you can run:

### `npm run dev`
Runs the app in development mode.
Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

The page will reload if you make edits.
You will also see any lint errors in the console.

### `npm run build`
Builds the app for production to the `dist` folder.
It correctly bundles Preact in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.
Your app is ready to be deployed!

### `npm run preview`
Locally previews the production build.

### `npm run generate`
Runs Plop to generate new components or atoms based on templates.

## Technologies Used

-   **React**: A JavaScript library for building user interfaces, maintained by Facebook and a community of individual developers and companies.
-   **Material-UI (MUI)**: A comprehensive React UI toolset for building features faster.
-   **Vite**: A next-generation frontend tooling that provides an extremely fast development experience.
-   **Axios**: Promise-based HTTP client for the browser and Node.js.
-   **Node.js**: JavaScript runtime environment(v20).
-   **npm / Yarn**: Package managers for JavaScript.

## Publishing to NPM

This project's components are designed to be published as an NPM package. There are two primary ways to publish updates:

### Manual Publishing

Follow these steps for a manual publishing process:

1.  **Build and Commit**: First, build the library and commit your changes.
    ```bash
    npm run build
    git add .
    git commit -m 'Your descriptive commit message'
    ```
2.  **Update Version**: Increment the package version using one of the following commands:
    -   `npm version patch`: For bug fixes.
    -   `npm version minor`: For a new component addition.
    -   `npm version major`: For a completed feature.
3.  **NPM Login**: Log in to your NPM account (if not already logged in).
    ```bash
    npm login
    ```
4.  **Publish**: Publish the package to NPM.
    ```bash
    npm publish --access public
    ```
5.  **Verify**: Check the version update on the NPM website after publishing.

### Automated Publishing with `publish.sh`

To automate the publishing process, you can use the provided `publish.sh` script. This script handles installing dependencies, committing changes (with a message like "Release: EBM AI Assistant package <version>"), updating the package version (patch, minor, or major based on your input), building the library, logging into NPM (using environment variables), and publishing the package.

    
1.  **Run the Publish Script**: Execute the `publish.sh` script with the desired version type (patch, minor, or major).
    ```bash
    ./publish.sh <version_type>
    ```
    *Example: `./publish.sh patch`*
    *Example: `./publish.sh minor`*
    *Example: `./publish.sh major`*

2.  **Verify**: Check the version update on the NPM website after publishing.

For more details on manual publishing, refer to the [NPM documentation](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages).


## Project Structure (Initial Observations)
- `src/`: Contains the main application source code.
  - `app.jsx`: Serves as a playground for developing and testing components in isolation before they are packaged for NPM. It's where new components are integrated and demonstrated.
  - `main.jsx`: Main application entry point for the development server.
  - `components/`: Reusable UI components, intended to be part of the published NPM package.
    - `aiAssistant/`: A significant part of the application, likely an AI-powered chat or assistant interface.
  - `atoms/`: Potentially smaller, more granular components or state management entities.
  - `assets/`: Static assets like images or SVGs.
  - `store/`: Suggests state management (e.g., Zustand, Redux, Context API).
- `plop-templates/`: Templates for generating new code using Plop.
- `dist/`: Output directory for production builds.
- `vite.config.js`: Vite configuration file.
- `package.json`: Project dependencies and scripts.

## Vite Library Mode
This project leverages Vite's library mode (`vite build --watch --mode library`) to build components into a shareable NPM package. This configuration optimizes the output for library consumption, making it easy to integrate these components into other projects. The `app.jsx` serves as a development playground to test these components during their creation.
>>>>>>> 8f6a73d2b26a69176b7837f59d48d812e915fa85
