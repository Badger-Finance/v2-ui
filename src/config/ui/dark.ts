import { createTheme } from '@material-ui/core';

const buttonPadding = '11px 13px';

const theme = createTheme({
	palette: {
		type: 'dark',
		primary: { main: '#F2A52B' },
		secondary: { main: '#121212' },
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
		fontFamily: "'Satoshi', 'IBM Plex Sans', sans-serif",
		h1: { fontWeight: 800, fontSize: '3rem' },
		h4: { fontSize: '1.3rem', fontWeight: 800 },
		h2: { fontSize: '2.2rem', fontWeight: 800, marginBottom: '.2rem' },
		h5: { fontWeight: 800 },
		subtitle1: { fontWeight: 600 },
		body1: { fontWeight: 600 },
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
				fontWeight: 600,
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
				background: '#121212',
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
		MuiButton: {
			label: {
				fontWeight: 800,
			},
		},
		MuiBackdrop: {
			root: {
				backgroundColor: 'rgba(18, 18, 18, 0.7)',
			},
		},
		MuiCheckbox: {
			colorPrimary: {
				'&$checked': {
					color: '#04BF00',
					// tick is transparent so we use this approach https://stackoverflow.com/a/57982412
					'& .MuiIconButton-label': {
						position: 'relative',
						zIndex: 0,
					},
					'& .MuiIconButton-label:after': {
						content: '""',
						left: 4,
						top: 4,
						height: 15,
						width: 15,
						position: 'absolute',
						backgroundColor: 'white',
						zIndex: -1,
					},
					'&:hover': {
						backgroundColor: 'rgba(4, 191, 0, 0.08)',
					},
				},
			},
		},
	},
});

export const darkTheme = createTheme({
	...theme,
	overrides: {
		...(theme.overrides ?? {}),
		MuiButton: {
			...(theme.overrides?.MuiButton ?? {}),
			root: {
				textTransform: 'capitalize',
				borderRadius: 10,
				[theme.breakpoints.down('xs')]: {
					padding: buttonPadding,
				},
			},
			outlined: {
				borderRadius: 10,
				[theme.breakpoints.down('xs')]: {
					padding: buttonPadding,
				},
			},
			contained: {
				borderRadius: 10,
				[theme.breakpoints.down('xs')]: {
					padding: buttonPadding,
				},
			},
			text: {
				borderRadius: 10,
				[theme.breakpoints.down('xs')]: {
					padding: buttonPadding,
				},
			},
		},
	},
});
