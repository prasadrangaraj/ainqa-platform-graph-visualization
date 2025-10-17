# ATP Graph Viewer

## Project Description
ATP Graph Viewer is an interactive graph visualization and editing tool specifically designed for visualizing and editing clinical guideline data stored in a Neo4j knowledge base. The application provides a comprehensive interface for healthcare professionals and researchers to explore, modify, and analyze complex medical knowledge graphs containing clinical guidelines for multiple diagnoses.

Built as an NPM package using Vite's library mode, it connects directly to Neo4j databases to offer real-time synchronization, advanced filtering capabilities, and seamless data management for medical guideline graphs with support for different node types (Symptoms, Observations, Investigations, Diagnoses) and their intricate relationships.

## Setup

### Prerequisites
- Node.js (v18+)
- npm

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
Builds the library for production to the `dist` folder.
It correctly bundles React in production mode and optimizes the build for library consumption.

The build is minified and the filenames include the hashes.
Your library is ready to be published!

### `npm run preview`
Locally previews the production build.

### `npm run generate`
Runs Plop to generate new components or atoms based on templates.

## Technologies Used

-   **React**: A JavaScript library for building user interfaces with TypeScript support
-   **TypeScript**: Typed superset of JavaScript for enhanced development experience
-   **Material-UI (MUI)**: Comprehensive React UI component library with custom icons
-   **Vite**: Next-generation frontend tooling providing extremely fast development and build experience
-   **D3.js**: Powerful data visualization library for creating interactive graphs and charts
-   **React Router DOM**: Declarative routing for React applications
-   **Node.js**: JavaScript runtime environment (v18+)
-   **npm**: Package manager for JavaScript dependencies

## Features

### Graph Visualization
- **Interactive D3.js Graphs**: Force-directed graph layout optimized for clinical guideline visualization
- **Clinical Node Types**: Color-coded medical entities for clear diagnosis pathways:
  - Symptoms (Orange) - Patient reported symptoms and complaints
  - Observations (Blue) - Clinical findings and measurements
  - Investigations (Green) - Diagnostic tests and procedures
  - Diagnoses (Red) - Final diagnosis outcomes and conditions
- **Guideline Pathways**: Directed edges showing clinical decision-making relationships and diagnosis flows
- **Multi-Diagnosis Views**: Visualize complex clinical scenarios with multiple potential diagnosis routes

### Graph Editing
- **Add/Remove Nodes**: Create new nodes with customizable properties (type, code sets, conditions, references)
- **Edge Management**: Add, edit, and delete relationships between nodes
- **Real-time Sync**: Save changes back to the database with conflict resolution
- **Undo/Redo Support**: Track changes and revert modifications

### Knowledge Base Management
- **Clinical Guideline Browser**: Navigate through multiple diagnosis guidelines stored in Neo4j
- **Guideline Selection**: Choose from available medical protocols and diagnostic pathways
- **Advanced Search & Filter**: Find specific symptoms, investigations, or diagnosis patterns
- **Category Filtering**: Filter by medical node types (Symptoms, Observations, Investigations, Diagnoses)
- **Data Export**: Download clinical guideline graphs as JSON for research and analysis
- **Multi-Diagnosis Support**: Handle complex clinical scenarios with multiple diagnosis pathways

### User Interface
- **Dual Interface**: Switch between "Knowledge Base" and "Graph Editor" modes
- **Responsive Design**: Works across different screen sizes and devices
- **Intuitive Controls**: Context-sensitive side panels for editing properties
- **Error Handling**: Comprehensive error reporting and user feedback

### API Integration
- **Neo4j Backend**: Direct connection to Neo4j graph database for clinical guideline data
- **RESTful API**: Communicates with EBM (Evidence-Based Medicine) service API
- **Authentication**: Bearer token-based secure API communication
- **Data Persistence**: Automatic saving of graph modifications to Neo4j
- **Real-time Synchronization**: Live sync between graph visualization and Neo4j knowledge base
- **Clinical Guidelines**: Support for multiple diagnosis pathways and medical protocols

The tool bridges the gap between raw Neo4j graph data and human-understandable clinical workflows, making it easier to maintain and evolve medical knowledge bases

## Publishing to NPM

This project's components are designed to be published as an NPM package. There are two primary ways to publish updates:

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


## Project Structure

```
src/
├── app.tsx                    # Main application component
├── main.tsx                   # Application entry point
├── components/                # Reusable UI components
│   ├── Graph.tsx             # D3.js graph visualization component
│   ├── graphViewer.tsx       # Main graph viewer interface with navigation
│   ├── graphEditor.tsx       # Graph editing interface
│   ├── guidelineDb.tsx       # Knowledge base interface for guidelines
│   ├── navbar.tsx            # Navigation component
│   ├── drawer.tsx            # Side drawer for node/edge editing
│   ├── deleteModal.tsx       # Confirmation modal for deletions
│   ├── errorModal.tsx        # Error display modal
│   ├── snackbar.tsx          # Notification component
│   ├── optionBox.tsx         # Action buttons container
│   ├── icons/                # Custom SVG icons
│   │   ├── deleteIcon.tsx
│   │   ├── gridIcon.tsx
│   │   ├── homeIcon.tsx
│   │   ├── logoIcon.tsx
│   │   ├── searchFolderImage.tsx
│   │   ├── syncIcon.tsx
│   │   └── warningIcon.tsx
│   ├── assets/               # Static assets
│   │   └── loader.gif
│   └── utils/
│       └── api.ts            # API client for backend communication
├── atoms/                    # Reusable atomic components
│   └── index.tsx
└── assets/                   # Global static assets
    └── preact.svg
```

- `dist/`: Production build output directory
- `vite.config.js`: Vite configuration for library mode
- `package.json`: Project dependencies and build scripts

## Vite Library Mode
This project leverages Vite's library mode to build the ATP Graph Viewer as a shareable NPM package. The library exports the main `GraphViewer` component that can be integrated into other React applications. The `app.tsx` serves as a development playground to test and demonstrate the graph viewer functionality during development.

### Usage as NPM Package

After publishing to NPM, you can use the ATP Graph Viewer in your project:

```typescript
import GraphViewer from 'atp-graph-viewer';

function MyApp() {
  return (
    <div>
      <GraphViewer isNavbar={true} />
    </div>
  );
}
```

The component accepts the following props:
- `isNavbar`: Boolean to show/hide the navigation bar
