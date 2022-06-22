import { createMuiTheme } from '@material-ui/core';

export const lightTheme = createMuiTheme({
  palette: {
    type: 'light',
    primary: { main: '#F2A52B' },
    grey: {
      800: '#2b2b2b',
    },
    success: {
      contrastText: '#181818',
      main: '#7FD1B9',
    },
    info: {
      contrastText: '#ffffff',
      main: '#489FB5',
    },
    error: {
      contrastText: '#ffffff',
      main: '#F4442E',
    },
    warning: {
      contrastText: '#181818',
      main: '#F2A52B',
    },
  },
  typography: {
    fontFamily: "'Satoshi', 'IBM Plex Sans', sans-serif",
    h5: { fontWeight: 800 },
    body1: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 8,
  },
  overrides: {
    MuiTooltip: {
      tooltip: {
        fontSize: '1rem',
        backgroundColor: '#F2A52B',
        color: '#181818',
      },
      arrow: {
        color: '#F2A52B',
      },
    },
    MuiDrawer: {
      paper: {
        // background: "#121212",
      },
      paperAnchorDockedLeft: {
        borderRight: 0,
      },
    },
    MuiPaper: {
      outlined: {
        border: 0,
      },
    },
  },
});
