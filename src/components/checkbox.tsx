import { Checkbox, type CheckboxProps } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";

export const CheckBox = (props: CheckboxProps) => {
  return (
    <Checkbox
      disableRipple
      {...props} // <-- Makes it work with checked, defaultChecked, onChange, etc.
      icon={
        <span
          style={{
            width: 22,
            height: 22,
            display: "inline-block",
            borderRadius: 6,
            backgroundColor: "#E3E9EF",
            transition: "all 0.2s ease",
          }}
        />
      }
      checkedIcon={
        <span
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            backgroundColor: "#006DA7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
          }}
        >
          <CheckIcon style={{ color: "#fff", fontSize: 18 }} />
        </span>
      }
      sx={{
        padding: 0,
      }}
    />
  );
}
