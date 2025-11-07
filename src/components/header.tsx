import { Chip, Divider, Typography } from '@mui/material';
import { BlueHeartIcon } from './icons/blueHeartIcon';
import { Circle } from '@mui/icons-material';
import { PatientIdIcon } from './icons/patientIdIcon';
import { ClaenderIcon } from './icons/calenderIcon';

interface HeaderProps {
  imageName?: string;
  name?: string;
  age?: string;
  gender?: string;
  patientType?: string;
  mrn?: string;
  enc?: string;
  dateTime?: string;
}

export const Header = ({
  imageName = 'profileImg',
  name = 'Mohammad Al Dokh',
  age = '64Yrs',
  gender = 'MALE',
  patientType = 'Out Patient',
  mrn = 'MRN00_307',
  enc = 'ENC_33246',
  dateTime = '15 Jun 2025, 11:55:44 PM',
}: HeaderProps) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, width: '100%',padding:20 }}>
      {/* Left Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <BlueHeartIcon />
        <Typography style={{ fontSize: '20px', fontWeight: 600, color: '#171A1C' }}>
          AI Smart Care
        </Typography>
      </div>

      <Divider orientation="vertical" flexItem />

      {/* Patient Profile Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <img
          src={`/image/${imageName}.png`}
          alt="Profile"
          style={{ width: 40, height: 40 }}
        />

        <div>
          {/* Top Row */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography sx={{ fontSize: '14px', color: '#171A1C', fontWeight: 500 }}>
              {name}
            </Typography>
            <Circle sx={{ width: 4, color: '#6A7888' }} />
            <Typography sx={{ fontSize: '14px', color: '#32383E' }}>
              {age}, {gender}
            </Typography>
            <Chip
              label={patientType}
              size="small"
              sx={{
                fontSize: '12px',
                backgroundColor: '#32383E',
                color: '#ffffff',
                height: '20px',
                fontWeight: 500,
                paddingY:'1px'
              }}
            />
          </div>

          {/* Bottom Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <PatientIdIcon />
              <Typography sx={{ fontSize: '14px', color: '#32383E' }}>{mrn}</Typography>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <PatientIdIcon />
              <Typography sx={{ fontSize: '14px', color: '#32383E' }}>{enc}</Typography>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <ClaenderIcon />
              <Typography sx={{ fontSize: '14px', color: '#32383E' }}>{dateTime}</Typography>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
