import { OutlinedInput, withStyles } from '@material-ui/core';

export const AssetInput = withStyles({
	input: {
		padding: 8,
		maxWidth: 90,
		fontSize: 20,
	},
})(OutlinedInput);
