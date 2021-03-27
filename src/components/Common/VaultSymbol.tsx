import { CircularProgress } from '@material-ui/core';
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';

const useStyles = makeStyles((theme) => ({
	symbol: {
		marginTop: 'auto',
		marginBottom: 'auto',
		padding: theme.spacing(0, 0, 0, 0),
		marginRight: theme.spacing(2),
		display: 'inline-block',
		float: 'left',
		width: '2.4rem',
	},
}));

export const VaultSymbol = observer((props: any) => {
	const classes = useStyles();
	const { token, iconName } = props;

	// Return a formatted Vault Icon for the vault forms
	if (!token) return <CircularProgress style={{ float: 'left', marginRight: '.5rem' }} />;
	else {
		return (
			<img
				alt={`Badger ${token.asset} Vault Symbol`}
				className={classes.symbol}
				src={`assets/icons/${iconName}.png`}
			/>
		);
	}
});
