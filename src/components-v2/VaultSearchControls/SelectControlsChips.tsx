import React from 'react';
import { Chip, makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
	chips: {
		display: 'flex',
		flexWrap: 'wrap',
	},
	chip: {
		margin: 2,
	},
});

interface Props {
	selected: string[];
}

const SelectControlsChips = ({ selected }: Props) => {
	const classes = useStyles();
	return (
		<div className={classes.chips}>
			{selected.map((value) => (
				<Chip key={value} label={value} className={classes.chip} />
			))}
		</div>
	);
};

export default SelectControlsChips;
