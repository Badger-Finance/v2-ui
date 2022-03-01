import React from 'react';
import { createTheme } from '@material-ui/core';

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
		primary: { main: '#FFB84D' },
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
		MuiTabs: {
			indicator: {
				height: 2,
			},
		},
		MuiTab: {
			root: {
				'&:not(selected)': {
					color: '#8a8a8a',
				},
			},
			wrapper: {
				fontSize: 15,
				fontWeight: 700,
				textTransform: 'uppercase',
			},
		},
		MuiTooltip: {
			tooltip: {
				fontSize: '.95rem',
				backgroundColor: '#FFB84D',
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
			root: {
				borderRadius: 10,
				padding: '8px 20px',
			},
			outlined: {
				padding: '8px 20px',
			},
			text: {
				'& .MuiButton-startIcon': {
					marginRight: 5,
				},
				'& .MuiButton-endIcon': {
					marginLeft: 5,
				},
			},
			label: {
				textTransform: 'uppercase',
				fontSize: 15,
				fontWeight: 700,
			},
			containedPrimary: {
				'&:hover': {
					background: 'linear-gradient(0deg, rgba(18, 18, 18, 0.3), rgba(18, 18, 18, 0.3)), #FFB84D',
					boxShadow:
						'1px 1px 10px 5px rgba(0, 0, 0, 0.2), 0px 1px 1px rgba(0, 0, 0, 0.14), 0px 1px 3px rgba(0, 0, 0, 0.12)',
				},
				'&:disabled': {
					color: 'rgba(255, 255, 255, 0.37)',
					background: 'rgba(255, 255, 255, 0.15)',
				},
			},
			outlinedPrimary: {
				border: '1px solid #FFB84D',
				'&:hover': {
					background: 'rgba(255, 184, 77, 0.1)',
					border: '1px solid rgba(255, 184, 77, 0.5)',
				},
				'&:disabled': {
					color: 'rgba(255, 255, 255, 0.37)',
					border: '1px solid rgba(255, 255, 255, 0.15)',
				},
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

export const darkTheme = createTheme(theme);
