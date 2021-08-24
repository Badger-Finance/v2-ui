import React from 'react';
import { InputBase, MenuItem, Select } from '@material-ui/core';
import { Performance } from '../../../mobx/model/rewards/performance';
import { makeStyles } from '@material-ui/core/styles';

interface Props {
	value: keyof Performance;
	onChange: (mode: keyof Performance) => void;
}

const useStyles = makeStyles({
	root: {
		marginLeft: 8,
	},
	outlined: {
		paddingTop: 8,
		paddingBottom: 8,
		border: 0,
	},
});

export const ApyComparisonModeSelector = ({ value, onChange }: Props): JSX.Element => {
	const classes = useStyles();

	return (
		<Select
			color="secondary"
			value={value}
			input={<InputBase />}
			classes={{ outlined: classes.outlined }}
			className={classes.root}
		>
			<MenuItem value="oneDay" onClick={() => onChange('oneDay')}>
				1 DAY
			</MenuItem>
			<MenuItem value="threeDay" onClick={() => onChange('threeDay')}>
				3 DAYS
			</MenuItem>
			<MenuItem value="sevenDay" onClick={() => onChange('sevenDay')}>
				1 WEEK
			</MenuItem>
			<MenuItem value="thirtyDay" onClick={() => onChange('thirtyDay')}>
				1 MONTH
			</MenuItem>
		</Select>
	);
};
