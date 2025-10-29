import React, { useState, useRef, useEffect } from "react";
import { Box, Button, IconButton, MenuItem, Select, Typography } from "@mui/material";
import CustomSnackbar from "./snackbar";
// import Graph from "./Graph";
import OptionBox from "./optionBox";
import DrawerComponent, { type DrawerData } from "./drawer";
import CloseIcon from "@mui/icons-material/Close";
import {
  Public,
  Share,
  VisibilityOff,
  InsertDriveFile,
  Upload,
  Menu,
  FilterAlt,
  Add,
  InsertLink,
  CenterFocusStrong,
  Delete,
  FileDownload,
} from "@mui/icons-material";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import WarningIcon from "./icons/warningIcon";
import ErrorModal from "./errorModal";
import { fetchApi, type Guideline, type Neo4jDatabase } from "./utils/api";
import DeleteModal from "./deleteModal";
import SyncIcon from "./icons/syncIcon";
import DeleteIcon from "./icons/deleteIcon";
import { useGraphViewer } from "./GraphViewerContext";
import Neo4jGraph, { type GraphHandle } from "./neo4jGraph";
import ModalComponent from "./modal";

interface Node {
  id: string;
  name: string;
  type: string;
  code_set?: string;
  code?: string;
  condition?: string;
  reference?: string;
  text?: string;
  x?: number;
  y?: number;
  color?: string;
  fx?: number | null;
  fy?: number | null;
}

interface Link {
  id: string;
  source: string | Node;
  target: string | Node;
  source_node: string;
  destination_node: string;
  edge_name: string;
  reference?: string;
  text?: string;
}

interface GraphEditorProps {
  setActive: React.Dispatch<React.SetStateAction<string>>;
  isNavbar:boolean;
}

const GraphEditor: React.FC<GraphEditorProps> = ({setActive, isNavbar}) => {
  const { mode, guidelineId, setGuidelineId } = useGraphViewer();
  console.log("Context state - mode:", mode, "guidelineId:", guidelineId);
  const [selectedGuideline, setSelectedGuideline] = useState<Guideline | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [selectedElement, setSelectedElement] = useState<{
    type: "node" | "link";
    data: Node | Link;
  } | null>(null);
  const [addingEdge, setAddingEdge] = useState(false);
  const [edgeSource, setEdgeSource] = useState<Node | null>(null);
  const [filteredNodes, setFilteredNodes] = useState<Node[]>([]);
  const [filteredLinks, setFilteredLinks] = useState<Link[]>([]);
  const [hiddenNodes, setHiddenNodes] = useState<Set<string>>(new Set());
  const [hiddenLinks, setHiddenLinks] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [addingNode, setAddingNode] = useState(false);

  // Drawer for error messages
  const [showDrawer, setShowDrawer] = useState(false);
  const [errorDrawerData, setErrorDrawerData] = useState<[]>([]);

  const [saveDataLoading, setSaveDataLoading] = useState(false);

 const [openSideDrawer, setOpenSideDrawer] = useState(false)

  // Unified delete modal state
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ kind: 'database' | 'guideline'; id: number | string; name: string } | null>(null);
  const [deleteTitle, setDeleteTitle] = useState<string>("");
  const [deleteSubtitle, setDeleteSubtitle] = useState<string>("");

  // Add ref for the Graph component to call recenter method
  const graphRef = useRef<{ recenter: () => void }>(null);

  const resetAllStates = () => {
    setSelectedElement(null);
    setShowFilter(false);
    setAddingNode(false);
    setAddingEdge(false);
    setEdgeSource(null);
  };

  const handleNodeClick = (node: Node) => {
    if (addingEdge) {
      if (!edgeSource) {
        setEdgeSource(node);
        showSnackbar(`Selected source: ${node.name}. Now click target.`, "info");
      } else {
        if (node.id === edgeSource.id) {
          showSnackbar("Source and target cannot be the same.", "error");
          return;
        }
        handleAddEdge(edgeSource, node);
        setAddingEdge(false);
        setEdgeSource(null);
      }
    } else {
      setSelectedElement({ type: "node", data: node });
      setShowFilter(false);
      setAddingNode(false);
    }
  };

  const handleLinkClick = (link: Link) => {
    setSelectedElement({ type: "link", data: link });
    setShowFilter(false);
    setAddingNode(false);
  };

  const handleAddEdge = (source: Node, target: Node) => {
    const newLink: Link = {
      id: `edge-${Date.now()}`,
      source: source.id,
      target: target.id,
      source_node: source.id,
      destination_node: target.id,
      edge_name: "new relationship",
    };
    const updatedLinks = [...links, newLink];
    setLinks(updatedLinks);
    setFilteredLinks(
      updatedLinks.filter(
        (l) =>
          !hiddenLinks.has(l.id) &&
          !hiddenNodes.has(l.source_node) &&
          !hiddenNodes.has(l.destination_node)
      )
    );
  };

  const startAddEdge = () => {
    resetAllStates();
    setAddingEdge(true);
    setEdgeSource(null);
    alert("Click on the source node, then the target node to create an edge.");
  };

  const handleSaveEdit = (updatedData: DrawerData) => {
    if (addingNode) {
      // Create new node with the provided details
      const newNode: Node = {
        id: `node-${Date.now()}`,
        name: updatedData.name,
        type: updatedData.type,
        code_set: updatedData.codeSet,
        code: updatedData.code,
        condition: updatedData.condition,
        reference: updatedData.reference,
        text: updatedData.text,
        x: 0,
        y: 0,
        color: getDefaultColor(updatedData.type),
      };

      const updatedNodes = [...nodes, newNode];
      setNodes(updatedNodes);
      setFilteredNodes(updatedNodes.filter((n) => !hiddenNodes.has(n.id)));
      setAddingNode(false);
      setSelectedElement({ type: "node", data: newNode });
    } else if (selectedElement?.type === "node") {
      const nodeData = selectedElement.data as Node;

      // Preserve position and color data when updating
      const updatedNode = {
        ...nodeData,
        name: updatedData.name,
        type: updatedData.type,
        code_set: updatedData.codeSet,
        code: updatedData.code,
        condition: updatedData.condition,
        reference: updatedData.reference,
        text: updatedData.text,
      };

      setNodes((prev) =>
        prev.map((node) => (node.id === nodeData.id ? updatedNode : node))
      );

      setFilteredNodes((prev) =>
        prev.map((node) => (node.id === nodeData.id ? updatedNode : node))
      );

      // Update the selected element to reflect changes immediately
      setSelectedElement({ type: "node", data: updatedNode });
    } else if (selectedElement?.type === "link") {
      const linkData = selectedElement.data as Link;

      const updatedLink = {
        ...linkData,
        edge_name: updatedData.name,
        reference: updatedData.reference,
        text: updatedData.text,
      };

      setLinks((prev) =>
        prev.map((link) => (link.id === linkData.id ? updatedLink : link))
      );

      setFilteredLinks((prev) =>
        prev.map((link) => (link.id === linkData.id ? updatedLink : link))
      );

      // Update the selected element to reflect changes immediately
      setSelectedElement({ type: "link", data: updatedLink });
    }
  };

  const handleCancelEdit = () => {
    if (addingNode) {
      setAddingNode(false);
    }
  };

  const filterByCategory = (category: string) => {
    resetAllStates();
    if (category === "nodes") {
      setFilteredNodes(nodes.filter((n) => !hiddenNodes.has(n.id)));
      setFilteredLinks(
        links.filter(
          (l) =>
            !hiddenLinks.has(l.id) &&
            !hiddenNodes.has(l.source_node) &&
            !hiddenNodes.has(l.destination_node)
        )
      );
    } else if (category === "all") {
      setFilteredNodes(nodes.filter((n) => !hiddenNodes.has(n.id)));
      setFilteredLinks([]);
    }
  };

  const hideSelectedNode = () => {
    if (!selectedElement || selectedElement.type !== "node") {
      alert("Please select a node to hide.");
      return;
    }

    const nodeData = selectedElement.data as Node;
    const nodeId = nodeData.id;
    const newHiddenNodes = new Set(hiddenNodes);
    const newHiddenLinks = new Set(hiddenLinks);

    newHiddenNodes.add(nodeId);

    // Hide connected nodes and links
    links.forEach((link) => {
      if (link.source_node === nodeId) {
        newHiddenNodes.add(link.destination_node);
        newHiddenLinks.add(link.id);
      } else if (link.destination_node === nodeId) {
        newHiddenNodes.add(link.source_node);
        newHiddenLinks.add(link.id);
      }
    });

    setHiddenNodes(newHiddenNodes);
    setHiddenLinks(newHiddenLinks);
    setFilteredNodes(nodes.filter((n) => !newHiddenNodes.has(n.id)));
    setFilteredLinks(
      links.filter(
        (l) =>
          !newHiddenLinks.has(l.id) &&
          !newHiddenNodes.has(l.source_node) &&
          !newHiddenNodes.has(l.destination_node)
      )
    );
    resetAllStates();
  };

  const deleteSelected = () => {
    if (!selectedElement) {
      showSnackbar("Select a node or relationship first.", "warning");
      return;
    }

    if (selectedElement.type === "node") {
      const nodeData = selectedElement.data as Node;
      const id = nodeData.id;
      const newNodes = nodes.filter((n) => n.id !== id);
      const newLinks = links.filter(
        (l) => l.source_node !== id && l.destination_node !== id
      );

      setNodes(newNodes);
      setLinks(newLinks);
      setFilteredNodes(newNodes.filter((n) => !hiddenNodes.has(n.id)));
      setFilteredLinks(
        newLinks.filter(
          (l) =>
            !hiddenLinks.has(l.id) &&
            !hiddenNodes.has(l.source_node) &&
            !hiddenNodes.has(l.destination_node)
        )
      );
    } else if (selectedElement.type === "link") {
      const linkData = selectedElement.data as Link;
      const id = linkData.id;
      const newLinks = links.filter((l) => l.id !== id);

      setLinks(newLinks);
      setFilteredLinks(
        newLinks.filter(
          (l) =>
            !hiddenLinks.has(l.id) &&
            !hiddenNodes.has(l.source_node) &&
            !hiddenNodes.has(l.destination_node)
        )
      );
    }

    resetAllStates();
  };

  const downloadJson = () => {
    if (nodes.length === 0 && links.length === 0) {
      showSnackbar("No data to download!", "warning");
      return;
    }

    const graphData = {
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type,
        code_set: n.code_set || "",
        code: n.code || "",
        name: n.name,
        condition: n.condition || "",
        reference: n.reference || "",
        text: n.text || "",
      })),
      edges: links.map((l) => ({
        id: l.id,
        source_node: l.source_node,
        destination_node: l.destination_node,
        edge_name: l.edge_name,
        reference: l.reference || "",
        text: l.text || "",
      })),
    };

    try {
      const jsonStr = JSON.stringify(graphData, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "graph.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error generating JSON:", err);
      showSnackbar("Failed to generate JSON. Check console for details.", "error");
    }
  };

  const uploadJson = () => {
    resetAllStates();
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        handleJsonUpload(target.files[0]);
      }
    };
    input.click();
  };

  const handleJsonUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        const data = JSON.parse(result);

        if (!data.nodes || !data.edges) {
          throw new Error("Invalid JSON structure: missing nodes or edges");
        }

        const newNodes: Node[] = data.nodes.map((n: Node) => ({
          ...n,
          x: 0,
          y: 0,
          color: getDefaultColor(n.type),
        }));

        const newLinks: Link[] = data.edges.map((e: Link) => ({
          id: e.id,
          source: e.source_node,
          target: e.destination_node,
          source_node: e.source_node,
          destination_node: e.destination_node,
          edge_name: e.edge_name,
          reference: e.reference || "",
          text: e.text || "",
        }));

        setNodes(newNodes);
        setLinks(newLinks);
        setHiddenNodes(new Set());
        setHiddenLinks(new Set());
        setFilteredNodes(newNodes);
        setFilteredLinks(newLinks);
        resetAllStates();
        showSnackbar("JSON uploaded successfully!", "success");
      } catch (err) {
        console.error("Invalid JSON:", err);
        showSnackbar(
          'Invalid JSON file! Please ensure it has "nodes" and "edges" arrays with valid IDs.',
          "error"
        );
      }
    };
    reader.readAsText(file);
  };

  // Exact recenter function from HTML
  const recenter = () => {
    resetAllStates();
    if (graphRef.current && graphRef.current.recenter) {
      graphRef.current.recenter();
    }
  };

  const newGraph = () => {
    if (window.confirm("Start a new graph? This will clear all current data.")) {
      setNodes([]);
      setLinks([]);
      setFilteredNodes([]);
      setFilteredLinks([]);
      setHiddenNodes(new Set());
      setHiddenLinks(new Set());
      resetAllStates();
      setShowDrawer(false)
    }
  };

  const addNode = () => {
    resetAllStates();
    setAddingNode(true);
  };

  const filterGraph = (term: string) => {
    if (!term) {
      setFilteredNodes(nodes.filter((n) => !hiddenNodes.has(n.id)));
      setFilteredLinks(
        links.filter(
          (l) =>
            !hiddenLinks.has(l.id) &&
            !hiddenNodes.has(l.source_node) &&
            !hiddenNodes.has(l.destination_node)
        )
      );
      return;
    }

    const searchTermLower = term.toLowerCase();
    const matchingNodes = nodes.filter(
      (n) =>
        n.name.toLowerCase().includes(searchTermLower) ||
        n.type.toLowerCase().includes(searchTermLower) ||
        n.id.toLowerCase().includes(searchTermLower)
    );

    const matchingLinks = links.filter(
      (l) =>
        (l.edge_name || "").toLowerCase().includes(searchTermLower) ||
        l.id.toLowerCase().includes(searchTermLower)
    );

    const includedNodeIds = new Set<string>();
    const directLinks: Link[] = [];

    matchingNodes.forEach((node) => {
      includedNodeIds.add(node.id);
      links.forEach((link) => {
        if (
          link.source_node === node.id &&
          !hiddenNodes.has(link.destination_node)
        ) {
          includedNodeIds.add(link.destination_node);
          if (!hiddenLinks.has(link.id)) directLinks.push(link);
        } else if (
          link.destination_node === node.id &&
          !hiddenNodes.has(link.source_node)
        ) {
          includedNodeIds.add(link.source_node);
          if (!hiddenLinks.has(link.id)) directLinks.push(link);
        }
      });
    });

    matchingLinks.forEach((link) => {
      includedNodeIds.add(link.source_node);
      includedNodeIds.add(link.destination_node);
      if (
        !hiddenLinks.has(link.id) &&
        !hiddenNodes.has(link.source_node) &&
        !hiddenNodes.has(link.destination_node)
      ) {
        directLinks.push(link);
      }
    });

    setFilteredNodes(
      nodes.filter((n) => includedNodeIds.has(n.id) && !hiddenNodes.has(n.id))
    );
    setFilteredLinks(
      directLinks.filter(
        (l) =>
          !hiddenLinks.has(l.id) &&
          !hiddenNodes.has(l.source_node) &&
          !hiddenNodes.has(l.destination_node)
      )
    );

    if (selectedElement) {
      if (
        selectedElement.type === "node" &&
        !includedNodeIds.has((selectedElement.data as Node).id)
      ) {
        setSelectedElement(null);
      } else if (
        selectedElement.type === "link" &&
        !directLinks.some((l) => l.id === (selectedElement.data as Link).id)
      ) {
        setSelectedElement(null);
      }
    }
  };

  const getDefaultColor = (type: string): string => {
    const colorMap: { [key: string]: string } = {
      Symptom: "#ff7f0e",
      Observation: "#1f77b4",
      Investigation: "#2ca02c",
      Diagnosis: "#d62728",
    };
    return colorMap[type] || "#ffeb3b";
  };

  const getDrawerData = (): DrawerData | null => {
    if (addingNode) {
      // Return empty drawer data for adding a new node
      return {
        name: "",
        type: "Symptom",
        connections: [],
        codeSet: "",
        code: "",
        condition: "",
        reference: "",
        text: "",
      };
    }

    if (!selectedElement) return null;

    if (selectedElement.type === "node") {
      const node = selectedElement.data as Node;
      const connections = links
        .filter(
          (link) =>
            link.source_node === node.id || link.destination_node === node.id
        )
        .map((link) => {
          const isSource = link.source_node === node.id;
          const otherNodeId = isSource
            ? link.destination_node
            : link.source_node;
          const otherNode = nodes.find((n) => n.id === otherNodeId);
          const direction = isSource ? "→" : "←";
          return {
            description: `${link.edge_name} ${direction} ${
              otherNode?.name || ""
            }`,
          };
        });

      return {
        name: node.name,
        type: node.type,
        connections,
        codeSet: node.code_set || "",
        code: node.code || "",
        condition: node.condition || "",
        reference: node.reference || "",
        text: node.text || "",
      };
    } else {
      const link = selectedElement.data as Link;
      const sourceNode = nodes.find((n) => n.id === link.source_node);
      const targetNode = nodes.find((n) => n.id === link.destination_node);

      return {
        name: link.edge_name,
        type: "Relationship",
        connections: [],
        codeSet: "",
        code: "",
        condition: "",
        reference: link.reference || "",
        text: link.text || "",
        source: sourceNode?.name || "",
        target: targetNode?.name || "",
      };
    }
  };

  const jsonGraphButtons = [
    {
      label: "All",
      icon: <Public style={{ width: 15, marginRight: 2 }} />,
      onClick: () => filterByCategory("all"),
    },
    {
      label: "Nodes",
      icon: <Share style={{ width: 15, marginRight: 2 }} />,
      onClick: () => filterByCategory("nodes"),
    },
    {
      label: "Hide",
      icon: <VisibilityOff style={{ width: 15, marginRight: 2 }} />,
      onClick: hideSelectedNode,
    },
  ];

  const editableOptionsButtons = [
    {
      label: "New Graph",
      icon: <InsertDriveFile style={{ width: 15, marginRight: 2 }} />,
      onClick: newGraph,
    },
    {
      label: "Upload JSON",
      icon: <Upload style={{ width: 17, marginRight: 2 }} />,
      onClick: uploadJson,
    },
    {
      label: "Filter",
      icon: <FilterAlt style={{ width: 20, marginRight: 2 }} />,
      onClick: () => {
        resetAllStates();
        setShowFilter(true);
      },
    },
    {
      label: "Add Node",
      icon: <Add style={{ width: 18, marginRight: 2 }} />,
      onClick: addNode,
    },
    {
      label: "Add Edge",
      icon: <InsertLink style={{ width: 18, marginRight: 2 }} />,
      onClick: startAddEdge,
    },
    {
      label: "Center",
      icon: <CenterFocusStrong style={{ width: 15, marginRight: 2 }} />,
      onClick: recenter,
    },
    {
      label: "Delete",
      icon: <Delete style={{ width: 15, marginRight: 2 }} />,
      onClick: deleteSelected,
    },
    {
      label: "Download JSON",
      icon: <FileDownload style={{ width: 17, marginRight: 2 }} />,
      onClick: downloadJson,
    },
  ];

//   const handleGraphSync = (
//     graphNodes: Node[],
//     graphLinks: Link[]
//   ): { nodes: SyncNode[]; edges: SyncEdge[] } => {
//     // Convert graph nodes to the format expected by the sync API
//     const formattedNodes = graphNodes;

//     // Convert graph edges to the format expected by the sync API
//     const formattedEdges = graphLinks;

//     return {
//       nodes: formattedNodes,
//       edges: formattedEdges,
//     };
//   };

  const [showErrorComponent, setShowErrorComponent] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const ErrorButton = [
    {
      label: "Error",
      icon: <WarningIcon style={{ width: 15, marginRight: 2 }} />,
      onClick: () => setShowErrorComponent(true),
      sx: {
        borderColor: "#e50a0a",
        py: 1.5,
        backgroundColor: "#fdebeb",
        color: "#e50a0a",
        gap: 0.5,
      },
    },
  ];

  const handleSaveData = async () => {
    if (!selectedGuideline?.id) {
      showSnackbar("Please select a guideline first", "warning");
      return;
    }
    try {
      if (!nodes || nodes.length === 0) {
        showSnackbar("No graph data available to sync.", "error");
        return;
      }
      setSaveDataLoading(true);

      const processedNodes = nodes.map(node => ({
        id: node.id,
        type: node.type,
        code_set: node.code_set || "",
        code: node.code || "",
        condition:node.condition || "",
        reference:node.reference || "",
        name: node.name,
        text: node.text || ""
      }));

      const processedEdges = links.map(link => ({
        id: link.id,
        source_node: link.source_node,
        destination_node: link.destination_node,
        edge_name: link.edge_name,
        reference: link.reference || "",
        text: link.text || ""
      }));

      const payload = {
        guideline_id: selectedGuideline.id,
        nodes: processedNodes,
        edges: processedEdges,
      };

      const result = await fetchApi("/v1/knowledge-map/upsert", "POST", payload, selectedDatabase?.id);
      console.log("result", result);
      if (result.success) {
        showSnackbar("Database synchronized successfully!", "success");
        setShowDrawer(false);
        setErrorDrawerData([]);
        setGuidelineId(selectedGuideline.id);
        setActive("guidelines");
        resetAllStates();
      } else {
        showSnackbar(`Failed to sync database: ${result.message}`, "error");
      }
    } catch (error: unknown) {
      const validationErrors =
        (error as { validationErrors?: never })?.validationErrors || [];
      console.log("Error syncing database:", error);
      console.log("Data:", error);
      setShowDrawer(true);
      setErrorDrawerData(validationErrors as never);
      showSnackbar("The nodes and edges in the given knowledge map are not in the required format. Please check the errors to fix them", "error");
    } finally {
      setSaveDataLoading(false);
    }
  };

      const [guidelines, setGuidelines] = useState<Guideline[]>([]);
  const { databases, setDatabases, selectedDatabase, setSelectedDatabase} = useGraphViewer();
  console.log(databases,'databases')

  const handleDatabaseChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setGuidelines([])
    const value = event.target.value as string;
    const db = databases.find((d) => d.name === value) || null;
    if(db){
      setSelectedDatabase(db);
      getAndSetGuidelines(db?.id as number);
    }
    
  };  

  console.log(selectedDatabase,'selectedDatabase')
  
    // Control delete modal open
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const getAndSetGuidelines = async (id:number) => {
    try {
      const result = await fetchApi<Guideline[]>("/v1/knowledge-map/guidelines", "GET", undefined, id);
      if (result.success && result.data.length > 0) {
        setGuidelines(result.data); // Select the first guideline object
      }
    } catch (error) {
      console.error("Error fetching guidelines:", error);
    }
  };

  const getAndSetDataBase = async () => {
    try {
      const result = await fetchApi<Neo4jDatabase[]>("/v1/neo4j-databases", "GET");
      if (result.success && result.data.length > 0) {
        setDatabases(result.data); // Select the first guideline object
      }
    } catch (error) {
      console.error("Error fetching guidelines:", error);
    }
  };
  useEffect(() => {
    getAndSetDataBase()
  }, []);

  // useEffect(() => {
  //     getAndSetGuidelines();
    
  // }, [selectedDatabase?.id]);

      const [showAddGuidelineForm, setShowAddGuidelineForm] = useState(false);
      const [showDatabaseForm, setShowDatabaseForm] = useState(false);
      const [editingDatabaseId, setEditingDatabaseId] = useState<number | undefined>(undefined);
      const [editingDatabaseInitial, setEditingDatabaseInitial] = useState<{
        name: string;
        url: string;
        username: string;
        password: string;
        database: string;
        description: string;
      } | undefined>(undefined);

  const handleAddGuidelineClick = () => {
    setEditingGuidelineId(undefined as any);
    setEditingGuidelineInitial(undefined as any);
    setShowAddGuidelineForm(true);
  };

  const handleAddDatabaseClick = () => {
    setEditingDatabaseId(undefined);
    setEditingDatabaseInitial(undefined);
    setShowDatabaseForm(true);
  };

  const handleEditDatabaseClick = (db: Neo4jDatabase) => {
    setEditingDatabaseId(db.id);
    setEditingDatabaseInitial({
      name: db.name || '',
      url: db.url || '',
      username: db.username || '',
      password: db.password || '',
      database: db.database || '',
      description: db.description || '',
    });
    setShowDatabaseForm(true);
  };

  const handleCreateGuideline = async (
    newGuidelineName: string,
    newGuidelineAssociation: string,
    newGuidelinePublicationYear: string
  ) => {
    if (
      !newGuidelineName ||
      !newGuidelineAssociation ||
      !newGuidelinePublicationYear
    ) {
      showSnackbar("Please fill all fields.", "warning");
      return;
    }

    const payload = {
      name: newGuidelineName,
      version: 1,
      association: newGuidelineAssociation,
      publication_year: newGuidelinePublicationYear,
    };

    try {
      const result = await fetchApi<Guideline>("/v1/knowledge-map/guidelines", "POST", payload, selectedDatabase?.id);
      if (result.success) {
        showSnackbar("Guideline added successfully!", "success");
        if (selectedDatabase?.id) {
          getAndSetGuidelines(selectedDatabase.id);
        }
        setShowAddGuidelineForm(false); // Hide the form
      } else {
        showSnackbar(`Failed to add guideline: ${result.message}`, "error");
      }
    } catch (error) {
      console.error("Error creating guideline:", error);
      showSnackbar("Error creating guideline.", "error");
    }
  };

  const [editingGuidelineId, setEditingGuidelineId] = useState<string | undefined>(undefined);
  const [editingGuidelineInitial, setEditingGuidelineInitial] = useState<{
    name: string;
    association: string;
    publication_year: string;
  } | undefined>(undefined);

  const handleEditGuidelineClick = (g: Guideline) => {
    setEditingGuidelineId(g.id);
    setEditingGuidelineInitial({
      name: g.name,
      association: g.association,
      publication_year: g.publication_year,
    });
    setShowAddGuidelineForm(true);
  };

  const handleUpdateGuideline = async (
    name: string,
    association: string,
    publicationYear: string,
    id: string
  ) => {
    const payload = {
      name,
      version: 1,
      association,
      publication_year: publicationYear,
    };
    try {
      const result = await fetchApi<Guideline>(`/v1/knowledge-map/guidelines/${id}`, "PUT", payload, selectedDatabase?.id);
      if (result.success) {
        showSnackbar("Guideline updated successfully!", "success");
        if (selectedDatabase?.id) {
          await getAndSetGuidelines(selectedDatabase.id);
        }
        setShowAddGuidelineForm(false);
        setEditingGuidelineId(undefined);
        setEditingGuidelineInitial(undefined);
      } else {
        showSnackbar(`Failed to update guideline: ${result.message}`, "error");
      }
    } catch (error) {
      console.error("Error updating guideline:", error);
      showSnackbar("Error updating guideline.", "error");
    }
  };

  const handleDeleteGuideline = async (id: string) => {
    if (!selectedDatabase?.id) {
      showSnackbar("Please select a database first.", "warning");
      return;
    }
    try {
      const result = await fetchApi(`/v1/knowledge-map/guidelines/${id}`, "DELETE", undefined, selectedDatabase.id);
      if ((result as any).success) {
        showSnackbar("Guideline deleted successfully!", "success");
        await getAndSetGuidelines(selectedDatabase.id);
        if (guidelineId === id) {
          setGuidelineId(null);
          setSelectedGuideline(null);
        }
      } else {
        showSnackbar(`Failed to delete guideline: ${(result as any).message}`, "error");
      }
    } catch (error) {
      console.error("Error deleting guideline:", error);
      showSnackbar("Error deleting guideline.", "error");
    }
  };



  const handleCreateDatabase = async (payload: {
    name: string;
    url: string;
    username: string;
    password: string;
    database: string;
    description: string;
  }) => {
    if (!payload.name || !payload.url || !payload.username || !payload.password || !payload.database) {
      showSnackbar("Please fill all required fields.", "warning");
      return;
    }
    try {
      const result = await fetchApi<Neo4jDatabase>("/v1/neo4j-databases", "POST", payload);
      if (result.success) {
        showSnackbar("Database added successfully!", "success");
        await getAndSetDataBase();
        const createdName = payload.name;
        const db = databases.find((d) => d.name === createdName);
        if (db) {
          setSelectedDatabase(db);
          getAndSetGuidelines(db.id as number);
        }
        setShowDatabaseForm(false);
      } else {
        showSnackbar(`Failed to add database: ${result.message}`, "error");
      }
    } catch (error) {
      console.error("Error creating database:", error);
      showSnackbar("Error creating database.", "error");
    }
  };

  const handleUpdateDatabase = async (payload: {
    name: string;
    url: string;
    username: string;
    password: string;
    database: string;
    description: string;
  }, id?: number) => {
    if (!id) {
      showSnackbar("Please choose a database to update.", "warning");
      return;
    }
    try {
      const result = await fetchApi<Neo4jDatabase>(`/v1/neo4j-databases/${id}`, "PUT", payload);
      if (result.success) {
        showSnackbar("Database updated successfully!", "success");
        await getAndSetDataBase();
        const db = databases.find((d) => d.id === id);
        if (db) {
          setSelectedDatabase(db);
          getAndSetGuidelines(db.id as number);
        }
        setShowDatabaseForm(false);
        setEditingDatabaseId(undefined);
        setEditingDatabaseInitial(undefined);
      } else {
        showSnackbar(`Failed to update database: ${result.message}`, "error");
      }
    } catch (error) {
      console.error("Error updating database:", error);
      showSnackbar("Error updating database.", "error");
    }
  };

  const handleDeleteDatabase = async (id: number) => {
    try {
      const result = await fetchApi(`/v1/neo4j-databases/${id}`, "DELETE");
      if ((result as any).success) {
        showSnackbar("Database deleted successfully!", "success");
        await getAndSetDataBase();
        if (selectedDatabase?.id === id) {
          setSelectedDatabase(null as any);
          setGuidelineId(null);
          setGuidelines([]);
        }
      } else {
        showSnackbar(`Failed to delete database: ${(result as any).message}`, "error");
      }
    } catch (error) {
      console.error("Error deleting database:", error);
      showSnackbar("Error deleting database.", "error");
    }
  };

  const handleClickDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.kind === 'database') {
        await handleDeleteDatabase(deleteTarget.id as number);
      } else if (deleteTarget.kind === 'guideline') {
        await handleDeleteGuideline(deleteTarget.id as string);
      }
    } finally {
      setOpenDeleteModal(false);
      setDeleteTarget(null);
      setDeleteTitle("");
      setDeleteSubtitle("");
    }
  };

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as string;
    const selected = guidelines.find((g) => g.name === value);
    if (selected) {
      setSelectedGuideline(selected);
      // onGuidelineSelect?.(selected || null);
    } else {
      setSelectedGuideline(null);
      // onGuidelineSelect?.(null);
    }
  };

  const handleDeleteClick = () => {
    setDeleteModalOpen(true); // Open modal when delete clicked
  };


  return (
    <>
      <CustomSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleSnackbarClose}
      />

      {/* ---------- DELETE MODAL (Guideline only) ---------- */}
      <DeleteModal open={deleteModalOpen} setOpen={setDeleteModalOpen} />
      <DrawerComponent
        open={showAddGuidelineForm || showDatabaseForm}
        isNavbar={isNavbar}
        onClose={() => {
          if (showAddGuidelineForm) setShowAddGuidelineForm(false);
          if (showDatabaseForm) setShowDatabaseForm(false);
        }}
        showAddGuidelineForm={showAddGuidelineForm}
        onCreateGuideline={handleCreateGuideline}
        onCloseGuidelineForm={() => setShowAddGuidelineForm(false)}
        guidelineId={editingGuidelineId as any}
        guidelineInitial={editingGuidelineInitial}
        onUpdateGuideline={handleUpdateGuideline}
        showDatabaseForm={showDatabaseForm}
        onCreateDatabase={handleCreateDatabase}
        onCloseDatabaseForm={() => { setShowDatabaseForm(false); }}
        editDatabaseId={editingDatabaseId}
        editDatabaseInitial={editingDatabaseInitial}
        onUpdateDatabase={handleUpdateDatabase}
      />
      <Box
        sx={{
          flex: 1,
          display: "flex",
          position: "relative",
          backgroundColor: "white",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 30,
            left: openSideDrawer ? 278 : 80,
              // zIndex:100,
            width: (!!selectedElement || showFilter || addingNode) && openSideDrawer ? "57%" : !!selectedElement || showFilter || addingNode ? "63%" : openSideDrawer ? "79%" :  "83%",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{display:"flex", flexDirection:openSideDrawer ? "column" : "row", gap:"10px"}}>
          <Select
            value={selectedDatabase?.name || ""}
            onChange={(event) =>
              handleDatabaseChange(event as React.ChangeEvent<{ value: unknown }>)
            }
            displayEmpty
            renderValue={(value) => {
              if (!value) {
                return <Typography sx={{ color: '#666', fontSize: 14 }}>Select DB</Typography>;
              }
              return value;
            }}
            inputProps={{ "aria-label": "Select guideline" }}
            sx={{
              zIndex: 1111,
              minWidth: 252,
              height: 38,
              backgroundColor: "white",
              borderRadius: "8px",
              fontSize: 14,
              "& .MuiSelect-select": {
                paddingY: "8px",
                paddingX: "12px",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                border: "1px solid #ccc",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#01205C",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#01205C",
              },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  borderRadius: "10px",
                  boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
                  "& .MuiMenuItem-root": {
                    fontSize: 14,
                    paddingY: 1.2,
                    borderBottom: "2px solid #f2f2f2",
                  },
                  "& .MuiMenuItem-root:last-of-type": {
                    borderBottom: "none",
                  },
                  "& .MuiMenuItem-root:hover": {
                    backgroundColor: "#f5f5f5",
                  },
                },
              },
            }}
          >
            {databases.map((db) => (
              <MenuItem key={db.id} value={db.name} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontSize: 14, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{db.name}</Typography>
                <Box onClick={(e) => e.stopPropagation()} sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton size="small" onClick={() => handleEditDatabaseClick(db)}>
                    <EditOutlinedIcon fontSize="small"/>
                  </IconButton>
                  <IconButton size="small" onClick={() => {
                    setDeleteTarget({ kind: 'database', id: db.id, name: db.name });
                    setDeleteTitle('Delete Database');
                    setDeleteSubtitle(`Are you sure you want to delete database "${db.name}"? This cannot be undone.`);
                    setOpenDeleteModal(true);
                  }}>
                    <DeleteOutlineOutlinedIcon fontSize="small"/>
                  </IconButton>
                </Box>
              </MenuItem>
            ))}
            <MenuItem
              value="add_new"
              onClick={handleAddDatabaseClick}
              sx={{
                justifyContent: "center",
                fontWeight: 500,
                fontSize: 14,
                "&:hover": {
                  backgroundColor: "#f0f7ff",
                },
              }}
            >
              + Add
            </MenuItem>
          </Select>
          <Select
            value={selectedGuideline?.name || ""}
            onChange={(event) =>
              handleChange(event as React.ChangeEvent<{ value: unknown }>)
            }
            disabled={selectedDatabase?.id ? false : true}
            displayEmpty
            renderValue={(value) => {
              if (!value) {
                return <Typography sx={{ color: '#666', fontSize: 14 }}>Select guideline</Typography>;
              }
              return value;
            }}
            inputProps={{ "aria-label": "Select guideline" }}
            sx={{
              zIndex: 1111,
              minWidth: 252,
              height: 38,
              backgroundColor: "white",
              borderRadius: "8px",
              fontSize: 14,
              "& .MuiSelect-select": {
                paddingY: "8px",
                paddingX: "12px",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                border: "1px solid #ccc",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#01205C",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#01205C",
              },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  borderRadius: "10px",
                  boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
                  "& .MuiMenuItem-root": {
                    fontSize: 14,
                    paddingY: 1.2,
                    borderBottom: "2px solid #f2f2f2",
                  },
                  "& .MuiMenuItem-root:last-of-type": {
                    borderBottom: "none",
                  },
                  "& .MuiMenuItem-root:hover": {
                    backgroundColor: "#f5f5f5",
                  },
                },
              },
            }}
          >
            {guidelines.map((item: Guideline) => (
              <MenuItem key={item.id} value={item.name} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontSize: 14, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</Typography>
                <Box onClick={(e) => e.stopPropagation()} sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton size="small" onClick={() => handleEditGuidelineClick(item)}>
                    <EditOutlinedIcon fontSize="small"/>
                  </IconButton>
                  <IconButton size="small" onClick={() => {
                    setDeleteTarget({ kind: 'guideline', id: item.id, name: item.name });
                    setDeleteTitle('Delete Guideline');
                    setDeleteSubtitle(`Are you sure you want to delete guideline "${item.name}"? This cannot be undone.`);
                    setOpenDeleteModal(true);
                  }}>
                    <DeleteOutlineOutlinedIcon fontSize="small"/>
                  </IconButton>
                </Box>
              </MenuItem>
            ))}
            <MenuItem
              value="add_new"
              onClick={handleAddGuidelineClick}
              sx={{
                justifyContent: "center",
                fontWeight: 500,
                fontSize: 14,
                "&:hover": {
                  backgroundColor: "#f0f7ff",
                },
              }}
            >
              + Add
            </MenuItem>
          </Select>
          </Box>
          { (filteredLinks.length > 0 || filteredNodes.length > 0) &&
            <Button
              onClick={handleSaveData}
              disabled={saveDataLoading}
              sx={{
                backgroundColor: "#01205C",
                color: "white",
                gap: 1,
                padding: 1,
                mt:"-4px",
                minWidth:'150px',
                textTransform: "none",
                "&.Mui-disabled": {
                  backgroundColor: "#01205C",
                  color: "white",
                  opacity: 0.7
                },
                "&:hover": {
                  backgroundColor: "#01205C",
                },
                zIndex: 1111,
              }}
              size="small"
            >
              <SyncIcon style={{ 
                width: "20px",
                marginRight: "4px",
                display: "inline-block",
                transform: saveDataLoading ? "rotate(360deg)" : "rotate(0deg)",
                transition: "transform 1s linear",
                animation: saveDataLoading ? "rotation 1s infinite linear" : "none"
              }} />
              <style>
                {`
                  @keyframes rotation {
                    from {
                      transform: rotate(0deg);
                    }
                    to {
                      transform: rotate(360deg);
                    }
                  }
                `}
              </style>
              Save Graph
            </Button>
          }
        
          {deleteModalOpen &&
            <Button
              sx={{
                backgroundColor: "#fdebeb",
                border: "1px solid #e50a0a",
                color: "#e50a0a",
                gap: 1,
                padding: 1,
                px: 2,
                textTransform: "none",
                zIndex:1111,
              }}
              size="small"
              onClick={handleDeleteClick} // Open delete modal
            >
              <DeleteIcon />
              Delete
            </Button>
          }
        </div>

        <Box
          onClick={() => setOpenSideDrawer(true)}
          sx={{
            position: "absolute",
            cursor:"pointer",
            top: 30,
            left: 20,
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            backgroundColor:"#01205C",
            padding:'6px',
            borderRadius:'6px'
          }}
        >
          <Menu sx={{color:"#ffff"}}/>
        </Box>
        <ErrorModal
          drawerStyle={{minWidth:"100px", overflow:"hidden", mt:"0px", width:260}}
          open={openSideDrawer}
          isNavbar={isNavbar}
          showIcon={false}
          onClose={() => setOpenSideDrawer(false)}
        >

          <Box
            sx={{
              // position: "absolute",
                // top: 20,
                // left: 20,
                // zIndex: 10,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              p:"10px",
              position:"relative",
            }}
          >
            <IconButton sx={{position:"absolute", right:0, top:0}} onClick={() => setOpenSideDrawer(false)}><CloseIcon /></IconButton>
            {showDrawer && <OptionBox buttons={ErrorButton} title={""} />}
            <OptionBox title="Json Graph" buttons={jsonGraphButtons} />
            <OptionBox
              title="Editable Options"
              buttons={editableOptionsButtons}
            />

          </Box>
        </ErrorModal>

        <Box sx={{ flex: 1, height: "100%" }}>
          {/* <Graph
                ref={graphRef}
                nodes={filteredNodes}
                links={filteredLinks}
                onNodeClick={handleNodeClick}
                onLinkClick={handleLinkClick}
                onAddEdge={handleAddEdge}
                addingEdge={addingEdge}
                selectedElement={selectedElement || undefined}
              /> */}
          <Neo4jGraph
            ref={graphRef}
            nodes={filteredNodes}
            links={filteredLinks}
            onNodeClick={handleNodeClick}
            onlinkClick={handleLinkClick}
            onAddlink={handleAddEdge}
            addinglink={addingEdge}
            selectedElement={selectedElement || undefined}
          />
        </Box>

        <DrawerComponent
          open={!!selectedElement || showFilter || addingNode}
          onClose={resetAllStates}
          drawerData={getDrawerData()}
          onSaveEdit={handleSaveEdit}
          isNavbar={isNavbar}
          onCancelEdit={handleCancelEdit}
          onFilter={filterGraph}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          isAddingNode={addingNode}
          showFilter={showFilter}
        />
      </Box>
      {showErrorComponent && (
        <ErrorModal
          open={showErrorComponent}
          isNavbar={isNavbar}
          drawerStyle={{width:360}}
          onClose={() => setShowErrorComponent(false)}
        >
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: 1,
            maxHeight: 'calc(100vh - 200px)',
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#888',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#555',
            },
          }}>
            {errorDrawerData.map((error, index) => (
              <Typography 
                key={index} 
                sx={{ 
                  backgroundColor: '#fff3f3',
                  padding: 1,
                  borderRadius: 1,
                  marginBottom: 1.5,
                  whiteSpace: "pre-line",
                  border: '1px solid #ffcdd2'
                }}
              >
                {error}
              </Typography>
            ))}
            {!errorDrawerData && (
              <Typography>An unknown error occurred.</Typography>
            )}
          </Box>
        </ErrorModal>
      )}
       <ModalComponent
         open={openDeleteModal}
         setOpen={setOpenDeleteModal}
         handleClickDelete={() => { void handleClickDelete(); }}
         deleteText="Delete"
         deleteSubtitle={deleteSubtitle}
         deleteTitle={deleteTitle}
       />
    </>
  );
};

export default GraphEditor;
