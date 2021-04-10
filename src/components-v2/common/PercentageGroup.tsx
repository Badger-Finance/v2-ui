import React from 'react';
import { Button, ButtonGroup, makeStyles } from '@material-ui/core';

interface Props {
	options?: number[];
	disabled?: boolean;
	onChange: (percentage: number) => void;
}

const useStyles = makeStyles(() => ({
	button: {
		borderRadius: 0,
	},
}));

/**
 * Displays a group of buttons correspondent to a set of percentages
 * @param options the percentage options to display
 * @param disabled disables the button group
 * @param onChange function that handles percentage selection
 * @constructor
 */
export const PercentageGroup = ({ options = [], disabled = false, onChange }: Props) => {
	const classes = useStyles();

	return (
		<ButtonGroup variant="text" size="small" aria-label="text button group" disabled={disabled}>
			{options.map((amount: number, index: number) => (
				<Button
					key={`button_${amount}_${index}`}
					disableElevation
					variant="text"
					className={classes.button}
					onClick={() => {
						onChange(amount);
					}}
				>
					{amount}%
				</Button>
			))}
		</ButtonGroup>
	);
};
