import { createMuiTheme } from '@material-ui/core';

export const darkTheme = createMuiTheme({
	palette: {
		type: 'dark',
		primary: { main: '#F2A52B' },
		background: {
			default: '#181818',
			paper: '#2b2b2b',
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
		// fontSize: 16,
		fontFamily: "'IBM Plex Sans'",
		h1: { fontWeight: 500, fontSize: '3rem', fontFamily: 'IBM Plex Mono' },
		// h2: { fontFamily: "'Press Start 2P'", fontSize: "2rem" },
		// subtitle1: { },
		h4: { fontSize: "1.3rem", fontWeight: 500 },
		h2: { fontSize: '2.2rem', fontWeight: 500, marginBottom: '.2rem' },
		h5: { fontWeight: 500 },
		body1: { fontWeight: 500 },
		// h6: { fontFamily: "'Press Start 2P'" },
	},
	shape: {
		borderRadius: 8,
	},
	overrides: {
		MuiTooltip: {
			tooltip: {
				fontSize: '.95rem',
				backgroundColor: '#F2A52B',
				color: '#181818',
				fontWeight: 400,
				padding: '.5rem .8rem',
			},
			arrow: {
				color: '#F2A52B',
			},
		},
		MuiListItemIcon: {
			root: {
				minWidth: '2.2rem',
				fontSize: '1rem',
			},
		},
		MuiListItemText: {
			primary: {
				fontSize: 'inherit',
			},
		},
		MuiIcon: {},
		MuiDrawer: {
			paper: {
				background: "#121212",
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
