import { OutlinedInput, withStyles } from '@material-ui/core';

export const AssetInput = withStyles((theme) => ({
	input: {
		padding: '8px 4px',
		maxWidth: 90,
		fontSize: 20,
		[theme.breakpoints.down(500)]: {
			padding: '16px 4px',
			maxWidth: '100%',
			fontSize: 24,
		},
	},
	adornedStart: {
		paddingLeft: 4,
	},
	adornedEnd: {
		paddingRight: 4,
	},
	notchedOutline: {
		borderWidth: 2,
	},
}))(OutlinedInput);
