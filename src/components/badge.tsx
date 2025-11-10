import { Typography } from '@mui/material';

type BadgeComponentProps = {
  label: string;
  color: string;         
};

export const BadgeComponent: React.FC<BadgeComponentProps> = ({
  label,
  color
}) => {
  return (
    <Typography
      sx={{
        color,
        border: `1.5px solid ${color}`,
        borderRadius: 0.5,
        width: 'fit-content',
        px: 1,
        py: 0.5,
        fontSize: '14px',
        fontWeight: 500,
        display: 'inline-block',
        bgcolor:'transparent'
      }}
    >
      {label}
    </Typography>
  );
};
