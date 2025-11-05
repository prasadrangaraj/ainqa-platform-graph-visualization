import {
  Add,
  CenterFocusStrong,
  Delete,
  FileDownload,
  FilterAlt,
  // InsertDriveFile,
  InsertLink,
  Menu,
  Public,
  Share,
  // Upload,
  VisibilityOff,
} from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import { Box, Button, MenuItem, Select, Typography, IconButton } from "@mui/material";
import React, { useEffect, useRef, useState, useCallback } from "react";
import CustomSnackbar from "./snackbar";
import DeleteModal from "./deleteModal";
import DrawerComponent, { type DrawerData } from "./drawer";
import ErrorModal from "./errorModal";
import DeleteIcon from "./icons/deleteIcon";
import SearchFolderImage from "./icons/searchFolderImage";
import SyncIcon from "./icons/syncIcon";
import WarningIcon from "./icons/warningIcon";
import OptionBox from "./optionBox";
import { fetchApi, type Guideline, type Neo4jDatabase } from "./utils/api";
import { useGraphViewer } from "./GraphViewerContext";
import loader from "./assets/loader.gif";
import Neo4jGraph from "./neo4jGraph";
import Editor, { DiffEditor } from "@monaco-editor/react";

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
interface GuidelineDetail extends Guideline {
  nodes?: Array<{
    id: string;
    name: string;
    type: string;
    code_set?: string;
    code?: string;
    condition?: string;
    reference?: string;
    text?: string;
  }>;
  edges?: Array<{
    id: string;
    source_node: string;
    destination_node: string;
    edge_name: string;
    reference?: string;
    text?: string;
  }>;
  
}

const GuidelineDb = ({isNavbar}:{isNavbar:boolean}) => {
  const { guidelineId, setGuidelineId, databases, setDatabases, selectedDatabase, setSelectedDatabase, setHasUnsavedChanges, setIsEditingJson } = useGraphViewer();
  const [guidelines, setGuidelines] = useState<Guideline[]>([]);
  const[apiLoader, setApiLoader] = useState(false)

  // New state for unsaved changes modal
  const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const handleDatabaseChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    withUnsavedChangesCheck(() => {
      setGuidelines([])
      const value = event.target.value as string;
      const db = databases.find((d) => d.name === value) || null;
      if(db){
        setSelectedDatabase(db);
        getAndSetGuidelines(db?.id as number);
      }
    });
  };  

  const [selectedGuideline, setSelectedGuideline] = useState<Guideline | null>(
    null
  );
  
  const [detailLoading, setDetailLoading] = useState(false);

  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [initialNodes, setInitialNodes] = useState<Node[]>([]);
  const [initialLinks, setInitialLinks] = useState<Link[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
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
  const [deletedNodes, setDeletedNodes] = useState<Set<string>>(new Set());
  const [deletedLinks, setDeletedLinks] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [addingNode, setAddingNode] = useState(false);

  // Drawer for error messages
  const [showDrawer, setShowDrawer] = useState(false);
  const [errorDrawerData, setErrorDrawerData] = useState<string | null>(null);

  const [saveDataLoading, setSaveDataLoading] = useState(false);

    const [showAddGuidelineForm, setShowAddGuidelineForm] = useState(false);
  // Control delete modal open
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const [showErrorComponent, setShowErrorComponent] = useState(false);
  
  // Snackbar states
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "info" | "warning">("success");


  const [openSideDrawer, setOpenSideDrawer] = useState(false)

  // Monaco Editor state
  const [editorContent, setEditorContent] = useState<string>("");
  const [viewState, setViewState] = useState<"graph" | "json">("graph"); 
  const [hasJsonData, setHasJsonData] = useState(false);
  const [isEditingJson, setIsEditingJsonLocal] = useState(false);
  const [showDiffEditor, setShowDiffEditor] = useState(false);
  const [originalJson, setOriginalJson] = useState<string>("");
  const [hasJsonChanges, setHasJsonChanges] = useState(false);

  // Sync editing state with context
  useEffect(() => {
    setHasUnsavedChanges(hasJsonChanges && isEditingJson);
    setIsEditingJson(isEditingJson);
  }, [hasJsonChanges, isEditingJson, setHasUnsavedChanges, setIsEditingJson]);

  // Function to check if we should show unsaved changes modal
  const withUnsavedChangesCheck = (action: () => void) => {
    if (viewState === "json" && hasJsonChanges && isEditingJson) {
      setPendingAction(() => action);
      setShowUnsavedChangesModal(true);
    } else {
      action();
    }
  };

  // Handle discard changes
  const handleDiscardChanges = () => {
    setEditorContent(originalJson);
    setHasJsonChanges(false);
    setIsEditingJsonLocal(false);
    setShowDrawer(false);
    setShowDiffEditor(false);
    setShowUnsavedChangesModal(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  // Handle save changes
  const handleSaveChanges = () => {
    handleEditJson(); // This will save the JSON
    setShowUnsavedChangesModal(false);
    if (pendingAction) {
      // Wait a bit for save to complete then execute the action
      setTimeout(() => {
        if (pendingAction) {
          pendingAction();
          setPendingAction(null);
        }
      }, 500);
    }
  };

  // Handle cancel action
  const handleCancelAction = () => {
    setShowUnsavedChangesModal(false);
    setPendingAction(null);
  };

  const showSnackbar = useCallback((message: string, severity: "success" | "error" | "info" | "warning") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  }, []);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Helper to check if an ID is a locally created ID (starts with "node-" or "edge-")
  const isLocalId = useCallback((id: string) => {
    return id.startsWith("node-") || id.startsWith("edge-");
  }, []);

  // guidelineId
  // guidelineId comes from context

  // Add ref for the Graph component to call recenter method
  const graphRef = useRef<{ recenter: () => void }>(null);

  const getGuidelineDetail = async (guidelineId: string) => {
    try {
    setDetailLoading(true);  
      const result = await fetchApi<GuidelineDetail>(
        `/v1/knowledge-map/guidelines/guideline-with-graph/${guidelineId}`,
        "GET",
        undefined,
        selectedDatabase?.id
      );
      console.log(result,'result')
      const data = result;

        if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
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
        setInitialNodes(newNodes);
        setInitialLinks(newLinks);
        setHasChanges(false);
        setHiddenNodes(new Set());
        setHiddenLinks(new Set());
        setDeletedNodes(new Set());
        setDeletedLinks(new Set());
        setFilteredNodes(newNodes);
        setFilteredLinks(newLinks);
        
        // Set the JSON content in Monaco Editor
        setEditorContent(JSON.stringify({ nodes: data.nodes, edges: data.edges }, null, 2));
        setOriginalJson(JSON.stringify({ nodes: data.nodes, edges: data.edges }, null, 2));
        setHasJsonChanges(false);
        
        resetAllStates();
        showSnackbar("JSON loaded successfully!", "success");
    } catch (error) {
      console.error("Error fetching guideline details:", error);
      // showSnackbar("Error loading guideline details", "error");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleChange = async (event: React.ChangeEvent<{ value: unknown }>) => {
    withUnsavedChangesCheck(() => {
      const value = event.target.value as string;

      const selected = guidelines.find((g) => g.name === value);
      if (selected) {
        setSelectedGuideline(selected);
        // Update URL with the selected guideline ID
        setGuidelineId(selected.id);
        
      } else {
        setSelectedGuideline(null);
        // Remove the guideline parameter from URL
        setGuidelineId(null);
      }
    });
  };

  const resetAllStates = useCallback(() => {
    setSelectedElement(null);
    setShowFilter(false);
    setAddingNode(false);
    setAddingEdge(false);
    setEdgeSource(null);
  }, []);

  const handleNodeClick = (node: Node) => {
    if (addingEdge) {
      if (!edgeSource) {
        setEdgeSource(node);
        showSnackbar(`Selected source: ${node.name}. Now click target.`, "info");
      } else {
        if (node.id === edgeSource.id) {
          showSnackbar("Source and target cannot be the same.", "warning");
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
    withUnsavedChangesCheck(() => {
      resetAllStates();
      setAddingEdge(true);
      setEdgeSource(null);
      showSnackbar("Click on the source node, then the target node to create an edge.", "info");
    });
  };

  const checkForChanges = useCallback(() => {
    if (nodes.length !== initialNodes.length || links.length !== initialLinks.length) {
      setHasChanges(true);
      return;
    }

    const hasNodeChanges = nodes.some((node, index) => {
      const initialNode = initialNodes[index];
      return !initialNode || 
        node.name !== initialNode.name ||
        node.type !== initialNode.type ||
        node.code_set !== initialNode.code_set ||
        node.code !== initialNode.code ||
        // node.condition !== initialNode.condition ||
        node.reference !== initialNode.reference ||
        node.text !== initialNode.text;
    });

    const hasLinkChanges = links.some((link, index) => {
      const initialLink = initialLinks[index];
      return !initialLink ||
        link.source_node !== initialLink.source_node ||
        link.destination_node !== initialLink.destination_node ||
        link.edge_name !== initialLink.edge_name ||
        link.reference !== initialLink.reference ||
        link.text !== initialLink.text;
    });

    setHasChanges(hasNodeChanges || hasLinkChanges);
  }, [nodes, links, initialNodes, initialLinks]);

  useEffect(() => {
    checkForChanges();
  }, [nodes, links, checkForChanges]);

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
      setHasChanges(true);
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
      setHasChanges(true);
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
      setHasChanges(true);
    }
  };

  const handleCancelEdit = () => {
    if (addingNode) {
      setAddingNode(false);
    }
  };

  const filterByCategory = (category: string) => {
    withUnsavedChangesCheck(() => {
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
    });
  };

  const hideSelectedNode = () => {
    withUnsavedChangesCheck(() => {
      if (!selectedElement || selectedElement.type !== "node") {
        showSnackbar("Please select a node to hide.", "warning");
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
    });
  };

  const deleteSelected = () => {
    withUnsavedChangesCheck(() => {
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
        setDeletedNodes((prev) => new Set(prev).add(id));
        newLinks
          .filter(
            (l) => l.source_node === id || l.destination_node === id
          )
          .forEach((l) => setDeletedLinks((prev) => new Set(prev).add(l.id)));
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
        setDeletedLinks((prev) => new Set(prev).add(id));
      }

      resetAllStates();
    });
  };

  const downloadJson = () => {
    withUnsavedChangesCheck(() => {
      let dataToDownload;
      
      if (viewState === "json" && editorContent) {
        // Use the edited JSON content from Monaco editor
        try {
          dataToDownload = JSON.parse(editorContent);
        } catch (err) {
          showSnackbar("Invalid JSON in editor. Using graph data instead.", "warning");
          dataToDownload = {
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
        }
      } else {
        // Use current graph data
        dataToDownload = {
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
      }

      if (dataToDownload.nodes.length === 0 && dataToDownload.edges.length === 0) {
        showSnackbar("No data to download!", "warning");
        return;
      }

      try {
        const jsonStr = JSON.stringify(dataToDownload, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "graph.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showSnackbar("JSON downloaded successfully!", "success");
      } catch (err) {
        console.error("Error generating JSON:", err);
        showSnackbar("Failed to generate JSON. Check console for details.", "error");
      }
    });
  };

  // const uploadJson = () => {
  //   withUnsavedChangesCheck(() => {
  //     resetAllStates();
  //     const input = document.createElement("input");
  //     input.type = "file";
  //     input.accept = ".json";
  //     input.onchange = (event) => {
  //       const target = event.target as HTMLInputElement;
  //       if (target.files && target.files[0]) {
  //         handleJsonUpload(target.files[0]);
  //       }
  //     };
  //     input.click();
  //   });
  // };

  // const handleJsonUpload = (file: File) => {
  //   const reader = new FileReader();
  //   reader.onload = (e) => {
  //     try {
  //       const result = e.target?.result as string;
  //       const data = JSON.parse(result);

  //       if (!data.nodes || !data.edges) {
  //         throw new Error("Invalid JSON structure: missing nodes or edges");
  //       }

  //       const newNodes: Node[] = data.nodes.map((n: Node) => ({
  //         ...n,
  //         x: 0,
  //         y: 0,
  //         color: getDefaultColor(n.type),
  //       }));

  //       const newLinks: Link[] = data.edges.map((e: Link) => ({
  //         id: e.id,
  //         source: e.source_node,
  //         target: e.destination_node,
  //         source_node: e.source_node,
  //         destination_node: e.destination_node,
  //         edge_name: e.edge_name,
  //         reference: e.reference || "",
  //         text: e.text || "",
  //       }));

  //       setNodes(newNodes);
  //       setLinks(newLinks);
  //       setHiddenNodes(new Set());
  //       setHiddenLinks(new Set());
  //       setFilteredNodes(newNodes);
  //       setFilteredLinks(newLinks);
  //       resetAllStates();
  //       showSnackbar("JSON uploaded successfully!", "success");
  //     } catch (err) {
  //       console.error("Invalid JSON:", err);
  //       showSnackbar('Invalid JSON file! Please ensure it has "nodes" and "edges" arrays with valid IDs.', "error");
  //     }
  //   };
  //   reader.readAsText(file);
  // };

  // Handle editor content changes
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setEditorContent(value);
      // Check if content has changed from original
      if (originalJson && value !== originalJson) {
        setHasJsonChanges(true);
      } else {
        setHasJsonChanges(false);
      }
    }
  };

  // Handle edit/save JSON with validation
  const handleEditJson = async () => {
    if (isEditingJson) {
      // Save the edited JSON with validation
      try {
        const parsedData = JSON.parse(editorContent);
        
        if (!parsedData.nodes || !parsedData.edges) {
          throw new Error("Invalid JSON structure: missing nodes or edges");
        }

        // Validate the JSON structure
        const validationResult = await fetchApi("/v1/knowledge-map/validate", "POST", parsedData, selectedDatabase?.id);
        
        if (validationResult.success) {
          const newNodes: Node[] = parsedData.nodes.map((n: Node) => ({
            ...n,
            x: 0,
            y: 0,
            color: getDefaultColor(n.type),
          }));

          const newLinks: Link[] = parsedData.edges.map((e: Link) => ({
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
          
          // Update originalJson to the new saved state
          setOriginalJson(editorContent);
          setHasJsonChanges(false);
          setIsEditingJsonLocal(false);
          setShowDiffEditor(false);
          setErrorDrawerData(null);
          setShowDrawer(false);
          showSnackbar("JSON validated and saved successfully!", "success");
        } else {
          showSnackbar(`JSON validation failed: ${validationResult.message}`, "error");
          // DON'T reset isEditingJsonLocal here - keep it as true so button stays "Save Json"
        }
      } catch (err) {
        console.error("Invalid JSON:", err);
        setIsEditingJsonLocal(true);
      const validationErrors =
        (err as { validationErrors?: never })?.validationErrors || [];
      console.log("Error updating database:", err);
      console.log("Data:", err);
      setShowDrawer(true);
      setOpenSideDrawer(true)
      setErrorDrawerData(validationErrors instanceof Error ? validationErrors.message : String(validationErrors));
      showSnackbar("The nodes and edges in the given knowledge map are not in the required format. Please check the errors to fix them", "error");
        // DON'T reset isEditingJsonLocal here - keep it as true so button stays "Save Json"
      }
    } else {
      // Enable editing - preserve the original state
      if (!originalJson) {
        setOriginalJson(editorContent);
      }
      setIsEditingJsonLocal(true);
    }
  };

  // Handle toggle diff editor
  const handleToggleDiffEditor = () => {
    if (showDiffEditor) {
      setShowDiffEditor(false);
    } else {
      // Only capture original state if we're not already editing
      if (!isEditingJson) {
        setOriginalJson(editorContent);
      }
      setShowDiffEditor(true);
    }
  };

  // Handle diff editor content changes
  const handleDiffEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setEditorContent(value);
      // Check if content has changed from original
      if (originalJson && value !== originalJson) {
        setHasJsonChanges(true);
      } else {
        setHasJsonChanges(false);
      }
    }
  };

  // Exact recenter function from HTML
  const recenter = () => {
    withUnsavedChangesCheck(() => {
      resetAllStates();
      if (graphRef.current && graphRef.current.recenter) {
        graphRef.current.recenter();
      }
    });
  };

  // const newGraph = () => {
  //   withUnsavedChangesCheck(() => {
  //     if (confirm("Start a new graph? This will clear all current data.")) {
  //       setNodes([]);
  //       setLinks([]);
  //       setFilteredNodes([]);
  //       setFilteredLinks([]);
  //       setHiddenNodes(new Set());
  //       setHiddenLinks(new Set());
  //       resetAllStates();
  //     }
  //   });
  // };

  const addNode = () => {
    withUnsavedChangesCheck(() => {
      resetAllStates();
      setAddingNode(true);
    });
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

  const getDefaultColor = useCallback((type: string): string => {
    const colorMap: { [key: string]: string } = {
      Symptom: "#ff7f0e",
      Observation: "#1f77b4",
      Investigation: "#2ca02c",
      Diagnosis: "#d62728",
    };
    return colorMap[type] || "#ffeb3b";
  }, []);

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
    // {
    //   label: "New Graph",
    //   icon: <InsertDriveFile style={{ width: 15, marginRight: 2 }} />,
    //   onClick: newGraph,
    // },
    // {
    //   label: "Upload JSON",
    //   icon: <Upload style={{ width: 17, marginRight: 2 }} />,
    //   onClick: uploadJson,
    // },
    {
      label: "Filter",
      icon: <FilterAlt />,
      onClick: () => {
        withUnsavedChangesCheck(() => {
          resetAllStates();
          setShowFilter(true);
        });
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
    withUnsavedChangesCheck(async () => {
      if (!selectedGuideline?.id) {
        showSnackbar("Please select a guideline first", "warning");
        return;
      }
      try {
        if (!nodes || nodes.length === 0) {
          showSnackbar("No graph data available to sync.", "warning");
          return;
      }
        setSaveDataLoading(true);

        const initialNodeIds = new Set(initialNodes.map((n) => n.id));
        const initialLinkIds = new Set(initialLinks.map((l) => l.id));

        // Categorize nodes
        const addedNodes = nodes
          .filter((node) => !initialNodeIds.has(node.id))
          .map((node) => ({
            id: node.id,
            type: node.type,
            code_set: node.code_set || "",
            code: node.code || "",
            name: node.name,
            condition: node.condition || "",
            reference: node.reference || "",
            text: node.text || "",
            "action-type": "add",
          }));

        const updatedNodes = nodes
          .filter((node) => {
            // Only consider nodes that are not new (already exist in initialNodes) and have changes
            const initialNode = initialNodes.find((n) => n.id === node.id);
            return (
              initialNode &&
              !isLocalId(node.id) && // Ensure it's not a newly created local ID
              (node.name !== initialNode.name ||
                node.type !== initialNode.type ||
                node.code_set !== initialNode.code_set ||
                node.code !== initialNode.code ||
                node.condition !== initialNode.condition ||
                node.reference !== initialNode.reference ||
                node.text !== initialNode.text)
            );
          })
          .map((node) => ({
            id: node.id,
            type: node.type,
            code_set: node.code_set || "",
            code: node.code || "",
            name: node.name,
            condition: node.condition || "",
            reference: node.reference || "",
            text: node.text || "",
            "action-type": "edit",
          }));

        const deletedNodesPayload = Array.from(deletedNodes)
          .filter((id) => !isLocalId(id)) // Only delete nodes that were synced to the DB
          .map((id) => ({
            id,
            "action-type": "delete",
          }));

        // Categorize links
        const addedLinks = links
          .filter((link) => !initialLinkIds.has(link.id))
          .map((link) => ({
            id: link.id,
            source_node: link.source_node,
            destination_node: link.destination_node,
            edge_name: link.edge_name,
            reference: link.reference || "",
            text: link.text || "",
            "action-type": "add",
          }));

        const updatedLinks = links
          .filter((link) => {
            const initialLink = initialLinks.find((l) => l.id === link.id);
            return (
              initialLink &&
              !isLocalId(link.id) && // Ensure it's not a newly created local ID
              (link.source_node !== initialLink.source_node ||
                link.destination_node !== initialLink.destination_node ||
                link.edge_name !== initialLink.edge_name ||
                link.reference !== initialLink.reference ||
                link.text !== initialLink.text)
            );
          })
          .map((link) => ({
            id: link.id,
            source_node: link.source_node,
            destination_node: link.destination_node,
            edge_name: link.edge_name,
            reference: link.reference || "",
            text: link.text || "",
            "action-type": "edit",
          }));

        const deletedLinksPayload = Array.from(deletedLinks)
          .filter((id) => !isLocalId(id)) // Only delete links that were synced to the DB
          .map((id) => ({
            id,
            "action-type": "delete",
          }));

        const payload = {
          guideline_id: selectedGuideline.id,
          nodes: [...addedNodes, ...updatedNodes, ...deletedNodesPayload],
          edges: [...addedLinks, ...updatedLinks, ...deletedLinksPayload],
        };

        const result = await fetchApi("/v1/knowledge-map/update", "POST", payload, selectedDatabase?.id);

        if (result.success) {
          showSnackbar("Database synchronized successfully!", "success");
          setShowDrawer(false);
          setErrorDrawerData(null);
          setInitialNodes([...nodes]);
          setInitialLinks([...links]);
          setHasChanges(false);
          setDeletedNodes(new Set());
          setDeletedLinks(new Set());
        } else {
          showSnackbar(`Failed to sync database: ${result.message}`, "error");
          setErrorDrawerData(result.message);
          setShowDrawer(true);
        }
      } catch (error) {
        console.error("Error syncing database:", error);
        setShowDrawer(true);
        setErrorDrawerData(
          error instanceof Error ? error.message : String(error)
        );
        showSnackbar("Error syncing database.", "error");
      } finally {
        setSaveDataLoading(false);
      }
    });
  };

  const getAndSetGuidelines = async (id?:number) => {
    setApiLoader(true)
    try {
      const result = await fetchApi<Guideline[]>("/v1/knowledge-map/guidelines", "GET", undefined, id);
      if (result.success && result.data.length > 0) {
        setGuidelines(result.data); // Select the first guideline object
      }
    } catch (error) {
      console.error("Error fetching guidelines:", error);
    } finally {
      setApiLoader(false)
    }
  };

  const getAndSetDataBase = async () => {
    setApiLoader(true)
    try {
      const result = await fetchApi<Neo4jDatabase[]>("/v1/neo4j-databases", "GET");
      if (result.success && result.data.length > 0) {
        setDatabases(result.data); // Select the first guideline object
      }
    } catch (error) {
      console.error("Error fetching guidelines:", error);
    } finally {
      setApiLoader(false)
    }
  };
  // Initialize data and token
  useEffect(() => {
    getAndSetDataBase()
  }, []);

  useEffect(() => {
    if(selectedDatabase?.id){
      getAndSetGuidelines(selectedDatabase?.id)
    }
  },[selectedDatabase?.id])

  // Handle URL parameter changes
  const memoizedGetGuidelineDetail = useCallback(getGuidelineDetail, [setDetailLoading, selectedDatabase, setSelectedDatabase, setGuidelineId, setNodes, setLinks, setInitialNodes, setInitialLinks, setHasChanges, setHiddenNodes, setHiddenLinks, setFilteredNodes, setFilteredLinks, resetAllStates, showSnackbar, getDefaultColor]);
 
  useEffect(() => {
    if (guidelineId && guidelines.length > 0) {
      const guideline = guidelines.find((g) => g.id === guidelineId);
      // if (
      //   guideline &&
      if (guideline) {
        setSelectedGuideline(guideline);
        memoizedGetGuidelineDetail(guidelineId);
      }
      else if (!guidelineId && selectedGuideline) {
        setSelectedGuideline(null);
      }
    }
  }, [guidelineId, setGuidelineId, guidelines, selectedDatabase, selectedGuideline, memoizedGetGuidelineDetail]);

 
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
    setApiLoader(true)
    try {
      const result = await fetchApi<Guideline>("/v1/knowledge-map/guidelines", "POST", payload, selectedDatabase?.id);
      if (result.success) {
        showSnackbar("Guideline added successfully!", "success");
        selectedDatabase?.id && getAndSetGuidelines(selectedDatabase?.id); // Refresh the list
        setShowAddGuidelineForm(false); // Hide the form
      } else {
        showSnackbar(`Failed to add guideline: ${result.message}`, "error");
      }
    } catch (error) {
      console.error("Error creating guideline:", error);
      showSnackbar("Error creating guideline.", "error");
    } finally {
      setApiLoader(false)
    }
  };

  const handleDeleteClick = () => {
    withUnsavedChangesCheck(() => {
      setDeleteModalOpen(true);
      setHasChanges(false) // Open modal when delete clicked
    });
  };

  const handleDeleteSuccess = (withGuideline:boolean) => {
    if (withGuideline){
      setGuidelineId(null);
      setNodes([]);
      setLinks([]);
      setSelectedGuideline(null);
      setSelectedDatabase(null as never)
      // setDatabases([])
      setFilteredNodes([]);
      setFilteredLinks([]);
      setHiddenNodes(new Set());
      setHiddenLinks(new Set());
      resetAllStates();
      getAndSetGuidelines();
    } else {
      setNodes([]);
      setLinks([]);
      resetAllStates();
      setFilteredNodes([]);
      setFilteredLinks([]);
      setHiddenNodes(new Set());
      setHiddenLinks(new Set());
    }
  };

  // Handle view state change with unsaved changes check
  const handleViewStateChange = (newViewState: "graph" | "json") => {
    withUnsavedChangesCheck(() => {
      setViewState(newViewState);
    });
  };

  return (
    <>
      <CustomSnackbar
        open={snackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={handleSnackbarClose}
      />

      {/* ---------- UNSAVED CHANGES MODAL ---------- */}
      {showUnsavedChangesModal && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
        >
          <Box
            sx={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '24px',
              width: '400px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            }}
          >
            <div style={{display:'flex',width:'100%',justifyContent:'space-between'}}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: '8px' }}>
              Unsaved Changes
            </Typography>
            <span onClick={handleCancelAction} style={{cursor:'pointer'}}><CloseIcon/></span>
            </div>
            <Typography variant="body2" sx={{ color: 'text.secondary', marginBottom: '24px' }}>
              You have unsaved changes in the JSON editor. Do you want to save them before proceeding?
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '12px',width:'100%' }}>
              <Button
                onClick={handleDiscardChanges}
                variant="outlined"
                sx={{
                  textTransform: 'none',
                  borderColor: '#d32f2f',
                  color: '#d32f2f',
                  '&:hover': {
                    backgroundColor: '#ffebee',
                    borderColor: '#d32f2f',
                  },
                }}
              >
                Discard
              </Button>
              <Button
                onClick={handleSaveChanges}
                variant="contained"
                sx={{
                  textTransform: 'none',
                  backgroundColor: '#01205C',
                  '&:hover': {
                    backgroundColor: '#001a4a',
                  },
                }}
              >
                Save Changes
              </Button>
            </Box>
          </Box>
        </Box>
      )}

    {detailLoading ? (
          <Box
            sx={{
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              position: "absolute",
              top: 0,
              right: 0,
              zIndex: 111111111111,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              height: "100%",
            }}
          >
            <img
              src={loader}
              alt="success"
              style={{ width: "100px", borderRadius: "50%" }}
            />
          </Box>
        ) : null}
      {guidelineId ? <>
        {/* ---------- DELETE MODAL ---------- */}
        <DeleteModal isSingle={(filteredLinks.length > 0 || filteredNodes.length > 0) ? true : false} open={deleteModalOpen} onDeleteSuccess={handleDeleteSuccess} setOpen={setDeleteModalOpen} showSnackbar={showSnackbar} />
        <DrawerComponent
          open={showAddGuidelineForm}
          isNavbar={isNavbar}
          onClose={() => setShowAddGuidelineForm(false)}
          showAddGuidelineForm={showAddGuidelineForm}
          onCreateGuideline={handleCreateGuideline}
          onCloseGuidelineForm={() => setShowAddGuidelineForm(false)}
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
              top: 28,
              left: 80,
              // zIndex:100,
              width: (!!selectedElement || showFilter || addingNode) && openSideDrawer && viewState === "graph" ? "57%" : !!selectedElement || showFilter || addingNode ? "70%" : openSideDrawer && viewState === "graph" ? "79%" :  "90%",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{display:"flex", flexDirection:openSideDrawer && viewState === "graph" ? "column" : "row", gap:"10px"}}>
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
              maxWidth: 252,
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
                {/* <Box onClick={(e) => e.stopPropagation()} sx={{ display: 'flex', gap: 0.5 }}>
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
                </Box> */}
              </MenuItem>
            ))}
            {apiLoader && <Box sx={{display:"flex", alignItems:"center", justifyContent:"center",}}><img
              src={loader}
              alt="success"
              style={{ width: "100px", borderRadius: "50%" }}
            /></Box>}
            {/* <MenuItem
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
            </MenuItem> */}
          </Select>
            <Select
              value={selectedGuideline?.name || ""}
              disabled={selectedDatabase?.id ? false : true}
              onChange={(event) =>
                handleChange(event as React.ChangeEvent<{ value: unknown }>)
              }
              displayEmpty
              renderValue={(value) => {
                if (!value) {
                  return <Typography sx={{ color: '#666', fontSize: 14 }}>Select guideline</Typography>;
                }
                return value;
              }}
              inputProps={{ "aria-label": "Select guideline" }}
              sx={{
                zIndex:1111,
                minWidth: 252,
                maxWidth: 252,
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
                <MenuItem key={item.id} value={item.name}>
                  <Typography sx={{ fontSize: 14 }}>{item.name}</Typography>
                </MenuItem>
              ))}
              {apiLoader && <Box sx={{display:"flex", alignItems:"center", justifyContent:"center",}}><img
              src={loader}
              alt="success"
              style={{ width: "100px", borderRadius: "50%" }}
            /></Box>}
              {/* <MenuItem
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
              </MenuItem> */}
            </Select>
            </Box>
            {/* {!guidelineId ? ( */}


            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:15,flexDirection: selectedElement ? "column" : "row"}}>
              {/* Graph/JSON Toggle Buttons */}
              {guidelineId && (
                <div
                  style={{
                    backgroundColor: "#01205C",
                    borderRadius: "5px",
                    padding: 5,
                    height: "35px",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    zIndex: 1111,
                  }}
                >
                  <Button
                    onClick={() => handleViewStateChange("graph")}
                    sx={{
                      backgroundColor: viewState === "graph" ? "white" : "#01205C",
                      color: viewState === "graph" ? "black" : "white",
                      textTransform: "none",
                      px: 2,
                      borderRadius: "8px",
                      height: "35px",
                      "&:hover": {
                        backgroundColor: viewState === "graph" ? "#f5f5f5" : "#01205C",
                        color: viewState === "graph" ? "#01205C" : "white",
                      },
                    }}
                  >
                    Graph
                  </Button>

                  <Button
                    onClick={() => handleViewStateChange("json")}
                    sx={{
                      backgroundColor: viewState === "json" ? "white" : "#01205C",
                      color: viewState === "json" ? "black" : "white",
                      textTransform: "none",
                      px: 2,
                      borderRadius: "8px",
                      height: "35px",
                      "&:hover": {
                        backgroundColor: viewState === "json" ? "#f5f5f5" : "#01205C",
                        color: viewState === "json" ? "#01205C" : "white",
                      },
                    }}
                  >
                    JSON
                  </Button>
                </div>
              )}
                {hasChanges ? (
                    <Button
                      onClick={handleSaveData}
                      disabled={saveDataLoading}
                      sx={{
                        backgroundColor: "#01205C",
                        color: "white",
                        gap: 1,
                        padding: 1,
                        minWidth:'150px',
                        maxHeight:"40px",
                        textTransform: "none",
                        "&.Mui-disabled": {
                          backgroundColor: "#01205C",
                          color: "white",
                          opacity: 0.7,
                        },
                        "&:hover": {
                          backgroundColor: "#01205C",
                        },
                        zIndex:1111,
                      }}
                      size="small"
                    >
                      <SyncIcon
                        style={{
                          width: "20px",
                          marginRight: "4px",
                          display: "inline-block",
                          transform: saveDataLoading
                            ? "rotate(360deg)"
                            : "rotate(0deg)",
                          transition: "transform 1s linear",
                          animation: saveDataLoading
                            ? "rotation 1s infinite linear"
                            : "none",
                        }}
                      />
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
                      Change Data
                    </Button>
                  ):
                
                  (<Button
                    sx={{
                      backgroundColor: "#fdebeb",
                      border: "1px solid #e50a0a",
                      color: "#e50a0a",
                      gap: 1,
                      padding: 1,
                      px: 2,
                      maxHeight:"40px",
                      textTransform: "none",
                      zIndex:1111,
                    }}
                    size="small"
                    onClick={handleDeleteClick} // Open delete modal
                  >
                    <DeleteIcon />
                    Delete
                  </Button>
                )}
            </div>
          </div>

          {/* Show menu icon in both graph and json views */}
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

          {/* Graph Tools Side Drawer */}
          <ErrorModal
            drawerStyle={{minWidth:"100px", width:260}}
            isNavbar={isNavbar}
            open={openSideDrawer && viewState === "graph"}
            showIcon={true}
            onClose={() => setOpenSideDrawer(false)}
          >
            <Box
              sx={{
                position: "absolute",
                top: 20,
                left: 20,
                zIndex: 10,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              {/* Error Button - Only show when there are errors */}
              {showDrawer && <OptionBox buttons={ErrorButton} title={""} />}
              
              {/* JSON Tools Menu */}
              <OptionBox 
                title="JSON Tools" 
                buttons={[
                  {
                    label: "Download JSON",
                    icon: <FileDownload style={{ width: 17, marginRight: 2 }} />,
                    onClick: downloadJson,
                  }
                ]} 
              />
            </Box>
          </ErrorModal>

          {/* JSON Tools Side Drawer */}
          <ErrorModal
            drawerStyle={{minWidth:"100px", width:260}}
            isNavbar={isNavbar}
            open={openSideDrawer && viewState === "json"}
            showIcon={false}
            onClose={() => setOpenSideDrawer(false)}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                p:"10px",
                position:"relative",
              }}
            >
              <IconButton sx={{position:"absolute", right:0, top:0}} onClick={() => setOpenSideDrawer(false)}>
                <CloseIcon />
              </IconButton>
              
              {/* Error Button - Only show when there are errors */}
              {showDrawer && (
                <OptionBox 
                  title="Validation" 
                  buttons={[
                    {
                      label: `Errors (${errorDrawerData ? errorDrawerData.split(',').length : 0})`,
                      icon: <WarningIcon style={{ width: 15, marginRight: 2 }} />,
                      onClick: () => setShowErrorComponent(true),
                      sx: {
                        borderColor: "#e50a0a",
                        py: 1.5,
                        backgroundColor: "#fdebeb",
                        color: "#e50a0a",
                        gap: 0.5,
                      },
                    }
                  ]} 
                />
              )}
              
              <OptionBox 
                title="JSON Tools" 
                buttons={[
                  {
                    label: "Download JSON",
                    icon: <FileDownload style={{ width: 17, marginRight: 2 }} />,
                    onClick: downloadJson,
                  }
                ]} 
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
            {viewState === 'graph' ? (
              // Graph view
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
            ) : (
              // Monaco Editor view
              <div style={{ marginTop:'100px',height:'560px',marginLeft:'20px', marginRight:'20px', position: 'relative' }}>
                {/* Edit/Save JSON Button */}
                <Box sx={{ 
                  position: 'absolute', 
                  top: 40, 
                  right: showDiffEditor? 40: 30, 
                  zIndex: 1000, 
                  display: 'flex', 
                  gap: 1,
                  alignItems: 'center',
                  backgroundColor: 'white',
                  padding: hasJsonChanges? '8px 12px':'0px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: hasJsonChanges ? '1px solid #e0e0e0' : 'none'
                }}>
                  {/* Diff Editor Toggle - Only show when there are changes */}
                  {hasJsonChanges && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography 
                        sx={{ 
                          fontSize: '12px', 
                          fontWeight: 500,
                          color: '#000000'
                        }}
                      >
                        Diff checker
                      </Typography>
                      <Box
                        onClick={handleToggleDiffEditor}
                        sx={{
                          width: 40,
                          height: 20,
                          backgroundColor: showDiffEditor ? '#01205c' : '#ccc',
                          borderRadius: 10,
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            backgroundColor: showDiffEditor ? '#01205c' : '#bdbdbd',
                          }
                        }}
                      >
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            backgroundColor: 'white',
                            borderRadius: '50%',
                            position: 'absolute',
                            top: 2,
                            left: showDiffEditor ? 22 : 2,
                            transition: 'all 0.3s ease',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                          }}
                        />
                      </Box>
                    </Box>
                  )}

                  {/* Vertical divider - Only show when there are changes and diff toggle is visible */}
                  {hasJsonChanges && (
                    <Box sx={{ width: '1px', height: '20px', backgroundColor: '#e0e0e0', mx: 1 }} />
                  )}

                  {/* Edit/Save Button */}
                  <Button
                    onClick={handleEditJson}
                    sx={{
                      backgroundColor: isEditingJson ? "#01205c" : "#ffffff",
                      color: isEditingJson ? "#ffffff" : "#000000",
                      border: isEditingJson ? "none" : "none",
                      textTransform: "none",
                      fontSize: '12px',
                      fontWeight: 500,
                      padding: '4px 12px',
                      minWidth: 'auto',
                      borderRadius: '6px',
                      "&:hover": {
                        backgroundColor: isEditingJson ? "#01205c" : "#ffffff",
                        opacity: 0.9,
                      },
                    }}
                    size="small"
                  >
                    {isEditingJson ? "Save Json" : "Edit Json"}
                  </Button>
                </Box>
                
                <div style={{width: "100%",marginLeft:'auto',height:'100%'}}>
                  {showDiffEditor ? (
                    <DiffEditor
                      height="100%"
                      language="json"
                      theme="vs-dark"
                      options={{
                        readOnly: !isEditingJson, // Only allow editing when isEditingJson is true
                        minimap: { enabled: false },
                      }}
                      original={originalJson}
                      modified={editorContent}
                      onMount={(editor, monaco) => {
                      // color you want for the overview ruler background
                      const RULER_BG = "#252526"; // VS Code dark background, change if you like
                      const BORDER_LEFT = "#1e1e1e";

                      // apply style to all existing canvases and parent container(s)
                      function applyStylesToCanvases() {
                        const canvases = document.querySelectorAll<HTMLCanvasElement>(
                          "canvas.original.diffOverviewRuler, canvas.modified.diffOverviewRuler"
                        );
                        canvases.forEach((c) => {
                          // direct style set (highest priority)
                          c.style.backgroundColor = RULER_BG;
                          c.style.borderLeft = `1px solid ${BORDER_LEFT}`;
                          // in case canvas is transparent and parent shows through, style parent diffOverview
                          const parent = c.closest(".diffOverview") as HTMLElement | null;
                          if (parent) parent.style.backgroundColor = RULER_BG;
                        });

                        // also target any ancestor that may show white (safe selectors)
                        const diffOverviewContainers = document.querySelectorAll<HTMLElement>(
                          ".monaco-diff-editor .diffOverview, .monaco-diff-editor .diffOverviewRuler"
                        );
                        diffOverviewContainers.forEach((el) => {
                          el.style.backgroundColor = RULER_BG;
                        });
                      }

                      // Run once right away
                      applyStylesToCanvases();

                      // MutationObserver: watch the diff editor container for added/changed canvases.
                      // It will re-apply styles if Monaco replaces/redraws canvases.
                      const root = document.querySelector(".monaco-diff-editor") || document.body;
                      const observer = new MutationObserver((mutations) => {
                        let changed = false;
                        for (const m of mutations) {
                          if (m.addedNodes && m.addedNodes.length) {
                            // if a canvas was added, reapply
                            for (const node of Array.from(m.addedNodes)) {
                              if (
                                node instanceof HTMLElement &&
                                (node.matches?.("canvas.diffOverviewRuler") ||
                                  node.querySelector?.("canvas.diffOverviewRuler"))
                              ) {
                                changed = true;
                                break;
                              }
                            }
                          }
                          // also if attributes changed on existing canvases
                          if (m.type === "attributes" && m.target instanceof HTMLCanvasElement) {
                            changed = true;
                          }
                          if (changed) break;
                        }
                        if (changed) applyStylesToCanvases();
                      });

                      observer.observe(root, {
                        childList: true,
                        subtree: true,
                        attributes: true,
                        attributeFilter: ["class", "style"],
                      });

                      // As a fallback, also run a short requestAnimationFrame loop for first 2s to catch late draws
                      const stopAt = performance.now() + 2000;
                      function rafLoop() {
                        applyStylesToCanvases();
                        if (performance.now() < stopAt) requestAnimationFrame(rafLoop);
                      }
                      requestAnimationFrame(rafLoop);

                      // Clean up when component unmounts (if you have a way to detect unmount)
                      // Save observer to editor for cleanup if you want:
                      (editor as any).__diffRulerObserver = observer;

                      // your existing change listener logic (kept)
                      try {
                        const modifiedEditor = (editor as any).getModifiedEditor
                          ? (editor as any).getModifiedEditor()
                          : null;
                        if (modifiedEditor) {
                          const model = modifiedEditor.getModel();
                          if (model) {
                            const disposable = model.onDidChangeContent(() => {
                              const val = model.getValue();
                              handleDiffEditorChange(val);
                            });
                            (editor as any).__changeDisposable = disposable;
                          }
                        }
                      } catch (e) {
                        console.warn("Failed to attach DiffEditor change listener", e);
                      }
                    }}
                    />
                  ) : (
                    <Editor
                      height="100%"
                      defaultLanguage="json"
                      value={editorContent}
                      onChange={handleEditorChange}
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        fontSize: 14,
                        lineNumbers: "on",
                        folding: true,
                        automaticLayout: true,
                        formatOnPaste: true,
                        formatOnType: true,
                        tabSize: 2,
                        readOnly: !isEditingJson, // Only allow editing when isEditingJson is true
                        scrollbar: {
                          verticalScrollbarSize: 30, 
                          horizontalScrollbarSize: 10, 
                          useShadows: false,
                          verticalHasArrows: false,
                          horizontalHasArrows: false,
                        },
                      }}
                    />
                  )}
                </div>
              </div>
            )}
          </Box>

          <DrawerComponent
          isNavbar={isNavbar}
            open={!!selectedElement || showFilter || addingNode}
            onClose={resetAllStates}
            drawerData={getDrawerData()}
            onSaveEdit={handleSaveEdit}
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
          isNavbar={isNavbar}
            open={showErrorComponent}
            drawerStyle={{width:360}}
            onClose={() => setShowErrorComponent(false)}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                maxHeight: "calc(100vh - 200px)",
                overflowY: "auto",
                "&::-webkit-scrollbar": {
                  width: "8px",
                },
                "&::-webkit-scrollbar-track": {
                  background: "#f1f1f1",
                  borderRadius: "4px",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "#888",
                  borderRadius: "4px",
                },
                "&::-webkit-scrollbar-thumb:hover": {
                  background: "#555",
                },
              }}
            >
              {errorDrawerData?.split(",").map((error, index) => (
                <Typography
                  key={index}
                  sx={{
                    backgroundColor: "#fff3f3",
                    padding: 1,
                    borderRadius: 1,
                    marginBottom: 1.5,
                    whiteSpace: "pre-line",
                    border: "1px solid #ffcdd2",
                  }}
                >
                  {error.trim()}
                </Typography>
              ))}
              {!errorDrawerData && (
                <Typography>An unknown error occurred.</Typography>
              )}
            </Box>
          </ErrorModal>
        )}
      </>
      :
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 28,
          width: "100%",
          height: "100vh",
          backgroundColor: "#f4f5f8",
        }}
      >
        <SearchFolderImage />
        <Typography style={{ color: "#001C3C", fontWeight: 600 }}>
          Choose Guidelines for graph View
        </Typography>
        <Box sx={{display:"flex", flexDirection:"column", gap:"10px"}}>
          <Typography sx={{color:"#6A7888", fontSize:"14px"}}>Select DB</Typography>
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
              minWidth: 400,
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
                {/* <Box onClick={(e) => e.stopPropagation()} sx={{ display: 'flex', gap: 0.5 }}>
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
                </Box> */}
              </MenuItem>
            ))}
            {apiLoader && <Box sx={{display:"flex", alignItems:"center", justifyContent:"center",}}><img
              src={loader}
              alt="success"
              style={{ width: "100px", borderRadius: "50%" }}
            /></Box>}
            {/* <MenuItem
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
            </MenuItem> */}
          </Select>
          </Box>
          <Box>
          <Box sx={{display:"flex", flexDirection:"column", gap:"10px"}}>
          <Typography sx={{color:"#6A7888", fontSize:"14px"}}>Select Guideline</Typography>
        <Select
          value={selectedGuideline?.name || ""}
          disabled={selectedDatabase?.id ? false : true}
          onChange={(event) =>
            handleChange(event as React.ChangeEvent<{ value: unknown }>)
          }
          displayEmpty
          renderValue={(value) => {
            if (!value) {
              return <Typography sx={{ color: '#666', fontSize: 14 }}>Select guideline</Typography>;
            }
            return value;
          }}
          inputProps={{ "aria-label": "Select guideline" }}
          sx={{
            minWidth: 400,
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
            <MenuItem key={item.id} value={item.name}>
              <Typography sx={{ fontSize: 14 }}>{item.name}</Typography>
            </MenuItem>
          ))}
          {apiLoader && <Box sx={{display:"flex", alignItems:"center", justifyContent:"center",}}><img
              src={loader}
              alt="success"
              style={{ width: "100px", borderRadius: "50%" }}
            /></Box>}
          {/* <MenuItem
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
                  </MenuItem> */}
        </Select>
        </Box>
        </Box>
      </div>}
    </>
  );
};

export default GuidelineDb;