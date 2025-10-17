import {
  // Avatar,
  // Divider,
  Typography
} from "@mui/material";
import React from "react";
// import GridIcon from "./icons/gridIcon";
// import HomeIcon from "./icons/homeIcon";
import LogoIcon from "./icons/logoIcon";

const Navbar: React.FC = () => {
  // 🔹 Guidelines stored dynamically
  // const [guidelines, setGuidelines] = useState<Guideline[]>([]);

  // // 🔹 Default selected value
  // const [selectedGuideline, setSelectedGuideline] = useState<Guideline | null>(
  //   null
  // );

  // // Control delete modal open
  // const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  // const getAndSetGuidelines = async () => {
  //   try {
  //     const result = await fetchApi<Guideline[]>("/guidelines", "GET");
  //     if (result.success && result.data.length > 0) {
  //       setGuidelines(result.data); // Select the first guideline object
  //     }
  //   } catch (error) {
  //     console.error("Error fetching guidelines:", error);
  //   }
  // };
  // useEffect(() => {
  //   getAndSetGuidelines();
  //   localStorage.setItem(
  //     "token",
  //     "emb-Bjmo1dtrzSqbTNJY2QJgMbbNfNJKdD89o4I5SfG"
  //   );
  // }, []);

  // const [showAddGuidelineForm, setShowAddGuidelineForm] = useState(false);

  // const handleAddGuidelineClick = () => {
  //   setShowAddGuidelineForm(true);
  // };

  // const handleCreateGuideline = async (
  //   newGuidelineName: string,
  //   newGuidelineAssociation: string,
  //   newGuidelinePublicationYear: string
  // ) => {
  //   if (
  //     !newGuidelineName ||
  //     !newGuidelineAssociation ||
  //     !newGuidelinePublicationYear
  //   ) {
  //     alert("Please fill all fields.");
  //     return;
  //   }

  //   const payload = {
  //     name: newGuidelineName,
  //     version: 1,
  //     association: newGuidelineAssociation,
  //     publication_year: newGuidelinePublicationYear,
  //   };

  //   try {
  //     const result = await fetchApi<Guideline>("/guidelines", "POST", payload);
  //     if (result.success) {
  //       alert("Guideline added successfully!");
  //       getAndSetGuidelines(); // Refresh the list
  //       setShowAddGuidelineForm(false); // Hide the form
  //     } else {
  //       alert(`Failed to add guideline: ${result.message}`);
  //     }
  //   } catch (error) {
  //     console.error("Error creating guideline:", error);
  //     alert("Error creating guideline.");
  //   }
  // };



  // const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
  //   const value = event.target.value as string;
  //   const selected = guidelines.find((g) => g.name === value);
  //   if (selected) {
  //     setSelectedGuideline(selected);
  //     onGuidelineSelect?.(selected || null);
  //   } else {
  //     setSelectedGuideline(null);
  //     onGuidelineSelect?.(null);
  //   }
  // };

  // const handleDeleteClick = () => {
  //   setDeleteModalOpen(true); // Open modal when delete clicked
  // };



  return (
    <div
      style={{
        zIndex: 11111,
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* ---------- TOP NAVBAR ---------- */}
      <div
        style={{
          backgroundColor: "#01205C",
          display: "flex",
          width: "98%",
          height: "28px",
          justifyContent: "space-between",
          padding: "16px",
        }}
      >
        {/* LEFT SECTION */}
        <div style={{ display: "flex", alignContent: "center", gap: 20 }}>
          {/* <span style={{ paddingTop: "3px" }}>
            <GridIcon />
          </span> */}
          <div style={{ display: "flex", alignContent: "center", gap: 4 }}>
            <LogoIcon />
            <Typography style={{ color: "white", paddingTop: "5px" }}>
              AINQA
            </Typography>
          </div>
        </div>

        {/* RIGHT SECTION */}
        
      </div>

      {/* --    -------- DROPDOWN SECTION ---------- */}
      {/* {active === "graph" && (
        <div
          style={{
            position: "absolute",
            top: 81,
            left: 210,
            width: "63%",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Select
            value={selectedGuideline?.name || ""}
            onChange={(event) =>
              handleChange(event as React.ChangeEvent<{ value: unknown }>)
            }
            displayEmpty
            inputProps={{ "aria-label": "Select guideline" }}
            sx={{
              minWidth: 300,
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
                borderColor: "#aaa",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#1976d2",
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
          {!deleteModalOpen ? (
            <Button
              onClick={handleClickSyncDB}
              disabled={loading}
              sx={{
                backgroundColor: "#01205C",
                color: "white",
                gap: 1,
                padding: 1,
                textTransform: "none",
                "&.Mui-disabled": {
                  backgroundColor: "#01205C",
                  color: "white",
                  opacity: 0.7
                },
                "&:hover": {
                  backgroundColor: "#01205C",
                }
              }}
              size="small"
            >
              <SyncIcon style={{ 
                width: "20px",
                marginRight: "4px",
                display: "inline-block",
                transform: loading ? "rotate(360deg)" : "rotate(0deg)",
                transition: "transform 1s linear",
                animation: loading ? "rotation 1s infinite linear" : "none"
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
              Save Data
            </Button>
          ) : (
            <Button
              sx={{
                backgroundColor: "#fdebeb",
                border: "1px solid #e50a0a",
                color: "#e50a0a",
                gap: 1,
                padding: 1,
                px: 2,
                textTransform: "none",
              }}
              size="small"
              onClick={handleDeleteClick} // Open delete modal
            >
              <DeleteIcon />
              Delete
            </Button>
          )}
        </div>
      )}
      <DeleteModal open={deleteModalOpen} setOpen={setDeleteModalOpen} />
      <DrawerComponent
        open={showAddGuidelineForm}
        onClose={() => setShowAddGuidelineForm(false)}
        showAddGuidelineForm={showAddGuidelineForm}
        onCreateGuideline={handleCreateGuideline}
        onCloseGuidelineForm={() => setShowAddGuidelineForm(false)}
      /> */}
    </div>
  );
};

export default Navbar;
