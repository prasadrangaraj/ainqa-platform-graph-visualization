import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface GraphViewerContextType {
  // Current mode: 'graph' for Graph Editor, 'guidelines' for Knowledge Base
  mode: 'graph' | 'guidelines';
  setMode: (mode: 'graph' | 'guidelines') => void;

  // Selected guideline ID for viewing/editing
  guidelineId: string | null;
  setGuidelineId: (id: string | null) => void;

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

  const clearState = () => {
    setGuidelineId(null);
    // Note: We don't clear mode here as it's controlled by the UI buttons
  };

  const value: GraphViewerContextType = {
    mode,
    setMode,
    guidelineId,
    setGuidelineId,
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
