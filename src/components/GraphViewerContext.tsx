import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { type Neo4jDatabase } from './utils/api';

interface GraphViewerContextType {
  // Current mode: 'graph' for Graph Editor, 'guidelines' for Knowledge Base
  mode: 'graph' | 'guidelines';
  setMode: (mode: 'graph' | 'guidelines') => void;

  // Selected guideline ID for viewing/editing
  guidelineId: string | null;
  setGuidelineId: (id: string | null) => void;
  setDatabases:(data:Neo4jDatabase[]) => void;
  selectedDatabase:Neo4jDatabase | null;
  setSelectedDatabase:(data:Neo4jDatabase) => void;
  // Neo4j databases (paginated fetch)
  databases: Neo4jDatabase[];

  // Clear all state (equivalent to clearing search params)
  clearState: () => void;
}

const GraphViewerContext = createContext<GraphViewerContextType | undefined>(undefined);

interface GraphViewerProviderProps {
  children: ReactNode;
}

export const GraphViewerProvider: React.FC<GraphViewerProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<'graph' | 'guidelines'>('graph');
  const [guidelineId, setGuidelineId] = useState<string | null>(null);
  const [databases, setDatabases] = useState<Neo4jDatabase[]>([]);
  const [selectedDatabase, setSelectedDatabase] = useState<Neo4jDatabase | null>(null);

  const clearState = () => {
    setGuidelineId(null);
    setDatabases([])
    setSelectedDatabase(null)
    // Note: We don't clear mode here as it's controlled by the UI buttons
  };

  const value: GraphViewerContextType = {
    mode,
    setMode,
    setDatabases,
    guidelineId,
    selectedDatabase,
    setSelectedDatabase,
    setGuidelineId,
    databases,
    clearState,
  };

  return (
    <GraphViewerContext.Provider value={value}>
      {children}
    </GraphViewerContext.Provider>
  );
};

export const useGraphViewer = (): GraphViewerContextType => {
  const context = useContext(GraphViewerContext);
  if (context === undefined) {
    throw new Error('useGraphViewer must be used within a GraphViewerProvider');
  }
  return context;
};

export default GraphViewerContext;
