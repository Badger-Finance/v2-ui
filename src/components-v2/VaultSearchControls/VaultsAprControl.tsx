import React from 'react';
import { Button, ButtonGroup, ButtonGroupProps, makeStyles } from '@material-ui/core';
import clsx from 'clsx';

const useStyles = makeStyles({
	selected: {
		backgroundColor: '#7B7B7B4D',
	},
	button: {
		width: 50,
	},
});

interface Props extends ButtonGroupProps {
	showAPR: boolean;
	onShowAPRChange: (showAPR: boolean) => void;
}

const VaultsAprControl = ({ showAPR, onShowAPRChange, ...muiProps }: Props): JSX.Element => {
	const classes = useStyles();

	return (
		<ButtonGroup {...muiProps} aria-label="apy apr selector">
			<Button
				aria-selected={!showAPR}
				className={clsx(!showAPR && classes.selected, classes.button)}
				onClick={() => onShowAPRChange(false)}
			>
				APY
			</Button>
			<Button
				aria-selected={showAPR}
				className={clsx(showAPR && classes.selected, classes.button)}
				onClick={() => onShowAPRChange(true)}
			>
				APR
			</Button>
		</ButtonGroup>
	);
};

export default VaultsAprControl;
