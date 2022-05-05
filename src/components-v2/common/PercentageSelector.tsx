import React from 'react';
import { Button, ButtonGroup, ButtonGroupProps, ButtonProps } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

interface Props extends Omit<ButtonGroupProps, 'onChange'> {
	selectedOption?: number;
	options?: number[];
	buttonProps?: ButtonProps;
	onChange: (percentage: number) => void;
}

const useStyles = makeStyles({
	button: {
		padding: '3px 9px',
	},
});

/**
 * Displays a group of buttons representing a set of percentages
 * @param selectedOption option that's currently selected.
 * @param options the percentage options to display
 * @param buttonProps props to drill down to buttons
 * @param groupProps groups props
 * @param onChange function that handles percentage selection
 * @constructor
 */
export const PercentageSelector = ({
	selectedOption,
	options = [],
	buttonProps = {},
	onChange,
	...groupProps
}: Props): JSX.Element => {
	const classes = useStyles();
	return (
		<ButtonGroup {...groupProps}>
			{options.map((amount: number, index: number) => (
				<Button
					{...{ ...buttonProps, className: clsx(buttonProps?.className, classes.button) }}
					aria-label={`${amount}%`}
					key={`button_${amount}_${index}`}
					variant={selectedOption === amount ? 'contained' : 'outlined'}
					onClick={() => onChange(amount)}
				>
					{amount}%
				</Button>
			))}
		</ButtonGroup>
	);
};
