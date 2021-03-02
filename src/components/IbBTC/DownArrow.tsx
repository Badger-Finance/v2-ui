import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
	arrowDown: {
		margin: '24px auto -5px',
	},
}));

export const DownArrow = (): any => {
	const classes = useStyles();

	return (
		<svg
			className={classes.arrowDown}
			width="13"
			height="18"
			viewBox="0 0 13 18"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M6.5 15.2138L11.6295 10L13 11.3931L6.5 18L-6.08938e-08 11.3931L1.37054 10L6.5 15.2138Z"
				fill="white"
			/>
			<line x1="6.5" y1="16" x2="6.5" y2="4.37114e-08" stroke="white" strokeWidth="2" />
		</svg>
	);
};
