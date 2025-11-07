import { Switch } from '@mui/material'
import { styled } from '@mui/material/styles';

export const AntSwitch = styled(Switch)(({ theme }) => ({
  width: 48,
  height: 23,
  padding: 0,
  display: 'flex',
  '& .MuiSwitch-switchBase': {
    padding: 2  ,
    '&.Mui-checked': {
      transform: 'translateX(25px)', 
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: '#14B786',
        opacity: 1,
      },
    },
  },
  '& .MuiSwitch-thumb': {
    boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
    width: 17,
    height: 17,
    borderRadius: 10,
    transition: theme.transitions.create(['width'], {
      duration: 200,
    }),
  },
  '& .MuiSwitch-track': {
    borderRadius: 22 / 2,
    opacity: 1,
    backgroundColor: 'rgba(0,0,0,.25)',
    boxSizing: 'border-box',
  },
}));

export const SwitchComponent = () => {
  return <AntSwitch defaultChecked />;
};
