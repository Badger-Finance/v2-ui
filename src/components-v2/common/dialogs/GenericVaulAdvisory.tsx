import { makeStyles } from '@material-ui/core';
import React from 'react';
import { ActionButton } from './styled';

const useStyles = makeStyles((theme) => ({
	vaultAdvisoryContainer: {
		display: 'flex',
		flexDirection: 'column',
		padding: theme.spacing(2),
		fontSize: '1.1rem',
	},
	childContainer: {
		margin: theme.spacing(1),
	},
}));

interface Props {
	children: React.ReactNode;
	accept: () => void;
}

const GenericVaultAdvisory = ({ children, accept }: Props): JSX.Element => {
	const classes = useStyles();
	return (
		<div className={classes.vaultAdvisoryContainer}>
			<div className={classes.childContainer}>{children}</div>
			<ActionButton aria-label="Deposit" size="large" onClick={accept} variant="contained" color="secondary">
				Accept
			</ActionButton>
		</div>
	);
};

export default GenericVaultAdvisory;
