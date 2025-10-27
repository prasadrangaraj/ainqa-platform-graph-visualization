import {
  useImperativeHandle,
  forwardRef,
  useEffect,
  useRef,
} from 'react';
import type { Node, Relationship } from '@neo4j-nvl/base';
import { InteractiveNvlWrapper } from '@neo4j-nvl/react';
import type { MouseEventCallbacks } from '@neo4j-nvl/react';

interface MedicalNode {
  id: string;
  name: string;
  type: string;
  code_set?: string;
  code?: string;
  condition?: string;
  reference?: string;
  text?: string;
  color?: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface MedicalEdge {
  id: string;
  source: string | MedicalNode;
  target: string | MedicalNode;
  source_node: string;
  destination_node: string;
  edge_name: string;
  reference?: string;
  text?: string;
}

interface GraphProps {
  nodes: MedicalNode[];
  links: MedicalEdge[];
  onNodeClick: (node: MedicalNode) => void;
  onlinkClick: (edge: MedicalEdge) => void;
  onAddlink?: (src: MedicalNode, dst: MedicalNode) => void;
  addinglink?: boolean;
  selectedElement?: { type: 'node' | 'link'; data: MedicalNode | MedicalEdge };
}

export interface GraphHandle {
  recenter: () => void;
}

const Neo4jGraph = forwardRef<GraphHandle, GraphProps>((props, ref) => {
  const { nodes, links, onNodeClick, onlinkClick } = props;

  const wrapperRef = useRef<any>(null);

  const colorMap: Record<string, string> = {
    Symptom: '#ff7f0e',
    Observation: '#1f77b4',
    Investigation: '#2ca02c',
    Diagnosis: '#d62728',
  };

  const getColor = (type: string) => colorMap[type] || '#ffeb3b';

  const getNvlNodes = (): Node[] =>
    nodes.map((n) => ({
      id: n.id,
      label: n.name,
      color: n.color || getColor(n.type),
      caption: n.name,
      properties: { ...n },
      fx: n.fx,
      fy: n.fy,
    }));

  const getNvlEdges = (): Relationship[] =>
    links.map((e) => {
      // Extract source and target IDs, handling both string and object formats
      const sourceId = typeof e.source === 'string' ? e.source : e.source.id;
      const targetId = typeof e.target === 'string' ? e.target : e.target.id;
      
      return {
        id: e.id,
        from: sourceId,
        to: targetId,
        type: e.edge_name,
        label: e.edge_name,
        properties: { ...e },
      };
    });

  const mouseEventCallbacks: MouseEventCallbacks = {
    onHover: () => {},
    onNodeClick: (n) => {
      const found = nodes.find((node) => node.id === n.id);
      if (found) onNodeClick(found);
    },
    onRelationshipClick: (r) => {
      const found = links.find((link) => link.id === r.id);
      if (found) onlinkClick(found);
    },
    onCanvasClick: () => {},
    onCanvasRightClick: () => {},
    onCanvasDoubleClick: () => {},
    onDrag: () => {},
    onPan: () => {},
    onZoom: () => {},
    onNodeRightClick: () => {},
    onNodeDoubleClick: () => {},
    onRelationshipRightClick: () => {},
    onRelationshipDoubleClick: () => {},
  };

  useImperativeHandle(ref, () => ({
    recenter: () => wrapperRef.current?.zoomToFit?.(),
  }));

  useEffect(() => {
    wrapperRef.current?.zoomToFit?.();
  }, [nodes, links]);

  return (
    <InteractiveNvlWrapper
      ref={wrapperRef}
      nodes={getNvlNodes()}
      rels={getNvlEdges()}
      layout="forceDirected"
      layoutOptions={{
        enableVerlet: true,
        intelWorkaround: true,
      }}
      mouseEventCallbacks={mouseEventCallbacks}
    />
  );
});

Neo4jGraph.displayName = 'Neo4jGraph';
export default Neo4jGraph;