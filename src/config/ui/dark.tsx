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
		primary: {
			main: '#FFB84D',
			dark: '#ED7E1D',
			light: '#FCF39E',
		},
		secondary: {
			main: '#91CDFF',
			dark: '#3CA9FF',
			light: '#BDE0FF',
		},
		background: {
			default: '#121212',
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
		text: {
			primary: '#e6e6e6',
			secondary: '#FFFFFF99',
			disabled: '#FFFFFF61',
		},
		divider: '#FFFFFF1F',
	},
	typography: {
		fontFamily: "'Satoshi', 'IBM Plex Sans', sans-serif",
		h1: { fontWeight: 500, fontSize: 96 },
		h2: { fontWeight: 500, fontSize: 60 },
		h3: { fontWeight: 500, fontSize: 48 },
		h4: { fontWeight: 500, fontSize: 34 },
		h5: { fontWeight: 500, fontSize: 24 },
		h6: { fontWeight: 500, fontSize: 20 },
		subtitle1: { fontWeight: 500, fontSize: 16 },
		subtitle2: { fontWeight: 500, fontSize: 14 },
		body1: { fontWeight: 400, fontSize: 16 },
		body2: { fontWeight: 400, fontSize: 14 },
		caption: { fontWeight: 500, fontSize: 10 },
		overline: { fontWeight: 500, fontSize: 12, textTransform: 'uppercase' },
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
				'&[aria-selected=false]': {
					color: '#8a8a8a',
				},
			},
			textColorPrimary: {},
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
				fontWeight: 400,
				padding: '.5rem .8rem',
			},
			arrow: {
				color: '#F2A52B',
			},
		},
		MuiDrawer: {
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
				border: '1px solid #FFFFFF6B',
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
				fontWeight: 500,
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
			sizeSmall: {
				'& .MuiButton-label': {
					fontSize: 13,
					fontWeight: 500,
				},
			},
			sizeLarge: {
				'& .MuiButton-label': {
					fontSize: 14,
					fontWeight: 700,
				},
			},
			fullWidth: {
				'& .MuiButton-label': {
					fontSize: 14,
					fontWeight: 700,
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
		MuiInputBase: {
			root: {
				fontSize: 16,
				fontWeight: 500,
			},
		},
		MuiOutlinedInput: {
			notchedOutline: {
				borderColor: '#FFFFFF6B',
			},
		},
	},
});

export const darkTheme = createTheme(theme);
