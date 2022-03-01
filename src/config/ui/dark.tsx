import React from 'react';
import { createTheme } from '@material-ui/core';

const buttonPadding = '11px 13px';

const theme = createTheme({
	props: {
		MuiCheckbox: {
			checkedIcon: <img src="/assets/icons/checked-checkbox.svg" alt="checked checkbox" />,
			icon: <img src="/assets/icons/non-checked-checkbox.svg" alt="checkbox" />,
		},
		MuiRadio: {
			checkedIcon: <img src="/assets/icons/checked-radio-control.svg" alt="option" />,
			icon: <img src="/assets/icons/non-checked-radio-control.svg" alt="option" />,
		},
	},
	breakpoints: {
		values: {
			xs: 0,
			sm: 600,
			md: 900,
			lg: 1200,
			xl: 1700,
		},
	},
	palette: {
		type: 'dark',
		primary: { main: '#F2BC1B' },
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
				backgroundColor: '#F2BC1B',
				color: '#181818',
				fontWeight: 600,
				padding: '.5rem .8rem',
			},
			arrow: {
				color: '#F2A52B',
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
			root: { marginLeft: 2 },
			colorPrimary: {
				'&$checked': {
					color: '#04BF00',
					'&:hover': {
						backgroundColor: 'rgba(4, 191, 0, 0.08)',
					},
				},
			},
		},
		MuiRadio: {
			colorPrimary: {
				'&$checked': {
					color: '#04BF00',
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
				fontSize: 14,
				textTransform: 'capitalize',
				borderRadius: 10,
				height: 50,
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
