import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  TextField,
  Drawer as MuiDrawer,
  IconButton,
} from "@mui/material";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import CloseIcon from "@mui/icons-material/Close";

export interface Connection {
  description: string;
}

export interface DrawerData {
  name: string;
  type: string;
  connections: Connection[];
  codeSet: string;
  code: string;
  condition: string;
  reference: string;
  text: string;
  source?: string;
  target?: string;
}

interface DrawerProps {
  open: boolean;
  onClose?: () => void;
  drawerData?: DrawerData | null;
  onSaveEdit?: (data: DrawerData) => void;
  onCancelEdit?: () => void;
  // New filter props
  onFilter?: (searchTerm: string) => void;
  searchTerm?: string;
  onSearchTermChange?: (term: string) => void;
  isAddingNode?: boolean;
  showFilter?: boolean;
  showAddGuidelineForm?: boolean;
  onCreateGuideline?: (name: string, association: string, publicationYear: string) => void;
  onCloseGuidelineForm?: () => void;
  isNavbar:boolean;
  // onCloseDetails?: () => void;
  // onCloseFilter?: () => void;
}

const DrawerComponent: React.FC<DrawerProps> = ({ 
  open,
  onClose,
  drawerData, 
  onSaveEdit, 
  onCancelEdit,
  // Filter props
  onFilter,
  searchTerm = "",
  onSearchTermChange,
  isAddingNode = false,
  showFilter = false,
  showAddGuidelineForm = false,
  onCreateGuideline,
  onCloseGuidelineForm,
  isNavbar,
  // onCloseFilter,
  // onCloseDetails
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<DrawerData | null>(null);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  useEffect(() => {
    if (isAddingNode) {
      setIsEditing(true);
      setEditData({
        name: "",
        type: "Symptom",
        connections: [],
        codeSet: "",
        code: "",
        condition: "",
        reference: "",
        text: "",
      });
    } else if (drawerData) {
      setIsEditing(false);
      setEditData(null);
    }
  }, [isAddingNode, drawerData]);

  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  const handleEdit = () => {
    if (drawerData) {
      setEditData({ ...drawerData });
      setIsEditing(true);
    }
  };

  const handleSaveEdit = () => {
    if (editData && onSaveEdit) {
      onSaveEdit(editData);
    }
    setIsEditing(false);
    setEditData(null);
  };

  const handleCancelEdit = () => {
    if (onCancelEdit) {
      onCancelEdit();
    }
    setIsEditing(false);
    setEditData(null);
  };

  const handleInputChange = (field: keyof DrawerData, value: string) => {
    if (editData) {
      setEditData(prev => prev ? { ...prev, [field]: value } : null);
    }
  };

  // Filter functionality
  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onFilter) {
      onFilter(localSearchTerm);
    }
  };

  const handleSearchTermChange = (term: string) => {
    setLocalSearchTerm(term);
    if (onSearchTermChange) {
      onSearchTermChange(term);
    }
  };

  const renderEmptyState = () => (
    <Box sx={{
      width: '100%',
      height: '100%',
    }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, textAlign: 'center' }}>
        Details
      </Typography>
      <Typography variant="body2" sx={{ fontSize: "16px", paddingTop: "13px" }}>
        Select a node or relationship
      </Typography>
    </Box>
  );

  const renderFilterPanel = () => (
    <Box>
      <Typography 
        variant="h6" 
        gutterBottom 
        sx={{
          display: 'flex',
          justifyContent: 'center',
          fontWeight: 600
        }}
      >
        Filter
      </Typography>
      
      <form onSubmit={handleFilterSubmit}>
        <TextField
          fullWidth
          placeholder="Search node, edge, or relationship"
          value={localSearchTerm}
          onChange={(e) => handleSearchTermChange(e.target.value)}
          sx={{
            marginBottom: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px', 
              backgroundColor: '#ffffff', // Solid white background
              '& fieldset': {
                borderColor: '#e0e0e0',
              },
              '&:hover fieldset': {
                borderColor: '#01205C',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#01205C',
              },
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#01205C',
            },
          }}
          size="small"
        />
        
        <Button
          type="submit"
          fullWidth
          sx={{
            background: '#01205C', // Use the new primary color
            color: 'white',
            padding: '10px 15px',
            fontSize: '14px',
            border: 'none',
            borderRadius: '8px', // Consistent border radius
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            boxShadow: "0 4px 10px rgba(0, 32, 92, 0.2)", // Add a subtle shadow
            '&:hover': {
              background: '#001C3C', // Darker shade on hover
              boxShadow: "0 6px 15px rgba(0, 32, 92, 0.3)",
            },
          }}
        >
          Submit
        </Button>
        <Button 
        fullWidth
        onClick={onClose}
        sx={{
          color: '#01205C',
          mt: 2,
          padding: '8px',
          border: '1px solid #01205C',
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 500,
          '&:hover': {
            backgroundColor: 'rgba(1, 32, 92, 0.04)',
          },
        }}
      >
        Cancel
      </Button>
      </form>
    </Box>
  );

  const renderEditForm = () => (
    <Box sx={{ 
      maxHeight: "calc(100vh - 139px)", 
      overflowY: "scroll",
      "&::-webkit-scrollbar": { width: "0px" },
      scrollbarWidth: "none", // For Firefox
      msOverflowStyle: "none", // For IE/Edge
    }}>
      <TextField
        label="Name"
        value={editData?.name || ''}
        onChange={(e) => handleInputChange('name', e.target.value)}
        fullWidth
        margin="normal"
        size="small"
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px', // Apply border radius here
            '& fieldset': {
              borderColor: '#e0e0e0',
            },
            '&:hover fieldset': {
              borderColor: '#01205C',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#01205C',
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#01205C',
          },
        }}
      />
      <TextField
        label="Type"
        value={editData?.type || ''}
        onChange={(e) => handleInputChange('type', e.target.value)}
        fullWidth
        margin="normal"
        size="small"
        disabled={drawerData?.type === 'Relationship'}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px', // Apply border radius here
            '& fieldset': {
              borderColor: '#e0e0e0',
            },
            '&:hover fieldset': {
              borderColor: '#01205C',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#01205C',
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#01205C',
          },
        }}
      />
      <TextField
        label="Code Set"
        value={editData?.codeSet || ''}
        onChange={(e) => handleInputChange('codeSet', e.target.value)}
        fullWidth
        margin="normal"
        size="small"
        disabled={drawerData?.type === 'Relationship'}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px', // Apply border radius here
            '& fieldset': {
              borderColor: '#e0e0e0',
            },
            '&:hover fieldset': {
              borderColor: '#01205C',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#01205C',
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#01205C',
          },
        }}
      />
      <TextField
        label="Code"
        value={editData?.code || ''}
        onChange={(e) => handleInputChange('code', e.target.value)}
        fullWidth
        margin="normal"
        size="small"
        disabled={drawerData?.type === 'Relationship'}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px', // Apply border radius here
            '& fieldset': {
              borderColor: '#e0e0e0',
            },
            '&:hover fieldset': {
              borderColor: '#01205C',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#01205C',
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#01205C',
          },
        }}
      />
      <TextField
        label="Condition"
        value={editData?.condition || ''}
        onChange={(e) => handleInputChange('condition', e.target.value)}
        fullWidth
        margin="normal"
        size="small"
        disabled={drawerData?.type === 'Relationship'}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px', // Apply border radius here
            '& fieldset': {
              borderColor: '#e0e0e0',
            },
            '&:hover fieldset': {
              borderColor: '#01205C',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#01205C',
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#01205C',
          },
        }}
      />
      <TextField
        label="Reference"
        value={editData?.reference || ''}
        onChange={(e) => handleInputChange('reference', e.target.value)}
        fullWidth
        margin="normal"
        size="small"
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px', // Apply border radius here
            '& fieldset': {
              borderColor: '#e0e0e0',
            },
            '&:hover fieldset': {
              borderColor: '#01205C',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#01205C',
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#01205C',
          },
        }}
      />
      <TextField
        label="Text"
        value={editData?.text || ''}
        onChange={(e) => handleInputChange('text', e.target.value)}
        fullWidth
        margin="normal"
        size="small"
        multiline
        rows={3}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px', // Apply border radius here
            '& fieldset': {
              borderColor: '#e0e0e0',
            },
            '&:hover fieldset': {
              borderColor: '#01205C',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#01205C',
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#01205C',
          },
        }}
      />
      
      <Button
        variant="contained"
        fullWidth
        onClick={handleSaveEdit}
        sx={{
          my: 1,
          textTransform: "none",
          background: "#01205C", // Use the new primary color
          borderRadius: "8px", // Consistent border radius
          fontSize: "14px",
          boxShadow: "0 4px 10px rgba(0, 32, 92, 0.2)", // Add a subtle shadow
          '&:hover': {
            background: "#001C3C", // Darker shade on hover
            boxShadow: "0 6px 15px rgba(0, 32, 92, 0.3)",
          },
        }}
      >
        {isAddingNode ? "Create Node" : "Save Changes"}
      </Button>
      
      <Button
        variant="outlined"
        // color="secondary"
        fullWidth
        onClick={handleCancelEdit}
        sx={{
          my: 1,
          textTransform: "none",
          borderRadius: "10px",
          fontSize: "14px",
          borderColor:"#01205C",
          color:"#01205C"
        }}
      >
        Cancel
      </Button>
    </Box>
  );

  const renderDetailsView = () => (
    <Box sx={{ 
      maxHeight: "calc(100vh - 139px)", 
      // mb:7,
      overflowY: "scroll",
      "&::-webkit-scrollbar": { width: "0px" },
      scrollbarWidth: "none", // For Firefox
      msOverflowStyle: "none", // For IE/Edge
    }}>
      <Typography variant="subtitle1" sx={{ mt: 3, fontWeight: 'bold', color: '#333' }}>
        Name:
        <Typography component="span" variant="body2" sx={{ ml: 1, color: '#555' }}>
          {drawerData?.name}
        </Typography>
      </Typography>
      <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 'bold', color: '#333' }}>
        Type:
        <Typography component="span" variant="body2" sx={{ ml: 1, color: '#555' }}>
          {drawerData?.type}
        </Typography>
      </Typography>

      {drawerData?.source && drawerData?.target && (
        <>
          <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 'bold', color: '#333' }}>
            Source:
            <Typography component="span" variant="body2" sx={{ ml: 1, color: '#555' }}>
              {drawerData.source}
            </Typography>
          </Typography>
          <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 'bold', color: '#333' }}>
            Target:
            <Typography component="span" variant="body2" sx={{ ml: 1, color: '#555' }}>
              {drawerData.target}
            </Typography>
          </Typography>
        </>
      )}

      <Button
        variant="contained"
        fullWidth
        onClick={handleEdit}
        sx={{
          my: 2,
          textTransform: "none",
          background: "#01205C", // Use the new primary color
          borderRadius: "8px", // Slightly less rounded for a modern look
          fontSize: "14px",
          boxShadow: "0 4px 10px rgba(0, 32, 92, 0.2)", // Add a subtle shadow
          '&:hover': {
            background: "#001C3C", // Darker shade on hover
            boxShadow: "0 6px 15px rgba(0, 32, 92, 0.3)",
          },
        }}
      >
        <DriveFileRenameOutlineIcon style={{ paddingRight: "3px", width: "20px" }} />
        EDIT
      </Button>

      {drawerData?.connections && drawerData.connections.length > 0 && (
        <>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Connections:
          </Typography>
          <List dense disablePadding>
            {drawerData.connections.map((conn, idx) => (
              <ListItem key={idx} sx={{ pl: 2, alignItems: "flex-start" }}>
                <FiberManualRecordIcon sx={{ fontSize: 7, mt: "11.5px", mr: 1.2 }} />
                <ListItemText
                  primaryTypographyProps={{ fontSize: "16px" }}
                  primary={conn.description}
                />
              </ListItem>
            ))}
          </List>
        </>
      )}

      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333', mt: 3, mb: 1 }}>
        Original Data:
      </Typography>
      {drawerData?.codeSet && (
        <Typography variant="body2" sx={{ fontSize: "15px", mb: 1.5, color: '#555' }}>
          <strong>Code Set:</strong> {drawerData.codeSet}
        </Typography>
      )}
      {drawerData?.code && (
        <Typography variant="body2" sx={{ fontSize: "15px", mb: 1.5, color: '#555' }}>
          <strong>Code:</strong> {drawerData.code}
        </Typography>
      )}
      {drawerData?.condition && (
        <Typography variant="body2" sx={{ fontSize: "15px", mb: 1.5, color: '#555' }}>
          <strong>Condition:</strong> {drawerData.condition}
        </Typography>
      )}
      {drawerData?.reference && (
        <Typography variant="body2" sx={{ fontSize: "15px", mb: 1.5, color: '#555' }}>
          <strong>Reference:</strong> {drawerData.reference}
        </Typography>
      )}
      {drawerData?.text && (
        <Typography variant="body2" sx={{ fontSize: "15px", pb: 3, color: '#555' }}>
          <strong>Text:</strong> {drawerData.text}
        </Typography>
      )}
      {/* <Button 
        fullWidth
        onClick={onClose}
        sx={{
          color: '#01205C',
          mt: 2,
          padding: '8px',
          border: '1px solid #01205C',
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 500,
          '&:hover': {
            backgroundColor: 'rgba(1, 32, 92, 0.04)',
          },
        }}
      >
        Cancel
      </Button> */}
    </Box>
  );

  const [newGuidelineName, setNewGuidelineName] = useState("");
  const [newGuidelineAssociation, setNewGuidelineAssociation] = useState("");
  const [newGuidelinePublicationYear, setNewGuidelinePublicationYear] = useState("");

  const renderGuidelineForm = () => (
    <Box sx={{ padding: "20px 10px" }}>
      <Typography variant="h6" sx={{ 
        mb: 3,
        fontWeight: 600,
        textAlign: 'center',
        color: '#01205C'
      }}>
        Add New Guideline
      </Typography>
      <TextField
        fullWidth
        label="Guideline Name"
        value={newGuidelineName}
        onChange={(e) => setNewGuidelineName(e.target.value)}
        margin="normal"
        size="small"
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px', 
            '& fieldset': {
              borderColor: '#e0e0e0',
            },
            '&:hover fieldset': {
              borderColor: '#01205C',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#01205C',
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#01205C',
          },
        }}
      />
      <TextField
        fullWidth
        label="Association"
        value={newGuidelineAssociation}
        onChange={(e) => setNewGuidelineAssociation(e.target.value)}
        margin="normal"
        size="small"
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px', 
            '& fieldset': {
              borderColor: '#e0e0e0',
            },
            '&:hover fieldset': {
              borderColor: '#01205C',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#01205C',
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#01205C',
          },
        }}
      />
      <TextField
        fullWidth
        label="Publication Year"
        value={newGuidelinePublicationYear}
        onChange={(e) => setNewGuidelinePublicationYear(e.target.value)}
        margin="normal"
        size="small"
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px', 
            '& fieldset': {
              borderColor: '#e0e0e0',
            },
            '&:hover fieldset': {
              borderColor: '#01205C',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#01205C',
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#01205C',
          },
        }}
      />
      <Button 
        fullWidth
        onClick={() => {
          if (onCreateGuideline) {
            onCreateGuideline(newGuidelineName, newGuidelineAssociation, newGuidelinePublicationYear);
            setNewGuidelineName("");
            setNewGuidelineAssociation("");
            setNewGuidelinePublicationYear("");
          }
        }} 
        sx={{
          backgroundColor: '#01205C',
          color: 'white',
          marginTop: '20px',
          padding: '10px',
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 500,
          '&:hover': {
            backgroundColor: '#01205C',
            opacity: 0.9,
          },
          '&:disabled': {
            backgroundColor: '#01205C',
            opacity: 0.7,
          },
        }}
      >
        Create
      </Button>
      <Button 
        fullWidth
        onClick={onCloseGuidelineForm} 
        sx={{
          color: '#01205C',
          mt: 2,
          padding: '8px',
          border: '1px solid #01205C',
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 500,
          '&:hover': {
            backgroundColor: 'rgba(1, 32, 92, 0.04)',
          },
        }}
      >
        Cancel
      </Button>
    </Box>
  );

  const renderContent = () => {
    if (showAddGuidelineForm) {
      return renderGuidelineForm();
    }

    // Show filter panel when showFilter is true AND no node is selected AND not adding a node
    if (showFilter && !drawerData && !isAddingNode) {
      return renderFilterPanel();
    }

    // Show empty state when no data and not adding a node
    if (!drawerData && !isAddingNode) {
      return renderEmptyState();
    }

    // Show edit form or details view when we have data or are adding a node
    return (
      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
          }}
        >
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{ textAlign: "center", width: "100%" }}
          >
            {isAddingNode ? "Add New Node" : drawerData?.type === 'Relationship' ? 'Relationship Details' : 'Node Details'}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {isEditing ? renderEditForm() : renderDetailsView()}
      </Box>
    );
  };

  return (
    <MuiDrawer
      anchor="right"
      open={open}
      onClose={onClose}
      hideBackdrop
      PaperProps={{
        sx: {
          width: 298,
          py: 3,
          px: 2,
          backgroundColor: "#ffffff",
          boxShadow: "0px 0px 15px rgba(0,0,0,0.4)",
          pointerEvents: "auto",
          paddingTop:isNavbar ? "80px" : "10px"
        },
      }}
      sx={{
        pointerEvents: "none",
      }}
    >
      {renderContent()}
    </MuiDrawer>
  );
};

export default DrawerComponent;