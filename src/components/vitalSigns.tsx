import { Box, Typography, Divider } from "@mui/material";
import { EcgHeartIcon } from "./icons/ecgHeartIcon";
import { HeiIcon } from "./icons/heiIcon";
import { BmiIcon } from "./icons/bmiIcon";
import { O2sIcon } from "./icons/o2sIcon";
import { RespIcon } from "./icons/respIcon";
import { WeightIcon } from "./icons/weightIcon";
import { TemperatureIcon } from "./icons/temperatureIcon";
import { BpIcon } from "./icons/bpIcon";

export const VitalSigns = ({
  data = {}
}: {
  data?: {
    hei?: string;
    bmi?: string;
    o2s?: string;
    resp?: string;
    wei?: string;
    temp?: string;
    pul?: string;
    bp?: string;
  };
}) => {
  const labelStyle = {
    color: "#555E68",
    fontSize: "14px",
    fontWeight: 500
  };

  const valueStyle = {
    color: "#171A1C",
    fontSize: "14px",
    fontWeight: 500,
    whiteSpace: "nowrap"
  };

  const placeholder = <Typography sx={{ color: "#B0B6BB", fontSize: "14px" }}>--</Typography>;

  const rowStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "14px"
  };

  const leftRows = [
    { icon: <HeiIcon />, label: "HEI", value: data.hei },
    { icon: <BmiIcon />, label: "BMI", value: data.bmi },
    { icon: <O2sIcon />, label: "O2S", value: data.o2s },
    { icon: <RespIcon />, label: "RESP", value: data.resp }
  ];

  const rightRows = [
    { icon: <WeightIcon />, label: "WEI", value: data.wei },
    { icon: <TemperatureIcon />, label: "TEMP", value: data.temp },
    { icon: <EcgHeartIcon />, label: "PUL", value: data.pul },
    { icon: <BpIcon />, label: "BP", value: data.bp }
  ];

  return (
    <Box sx={{ p: 1.9, borderRadius: 4, background: "#f8f9f9", width: "500px" }}>
      <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <EcgHeartIcon /> Vital Signs
      </Typography>

      <Box
        sx={{
          p: 3,
          borderRadius: 4,
          background: "#ffffff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "stretch",
          gap: 3
        }}
      >
        {/* LEFT */}
        <Box sx={{ flex: 1 }}>
          {leftRows.map((item, i) => (
            <Box key={i} sx={rowStyle}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {item.icon}
                <Typography sx={labelStyle}>{item.label}</Typography>
              </Box>
              {item.value ? <Typography sx={valueStyle}>{item.value}</Typography> : placeholder}
            </Box>
          ))}
        </Box>

        {/* DIVIDER */}
        <Divider orientation="vertical" sx={{ height: "auto", borderColor: "#E0E0E0" }} />

        {/* RIGHT */}
        <Box sx={{ flex: 1 }}>
          {rightRows.map((item, i) => (
            <Box key={i} sx={rowStyle}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1,justifyContent:'center' }}>
                {item.icon}
                <Typography sx={labelStyle}>{item.label}</Typography>
              </Box>
              {item.value ? <Typography sx={valueStyle}>{item.value}</Typography> : placeholder}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};
