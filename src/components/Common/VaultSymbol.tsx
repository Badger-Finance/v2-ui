import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';
import { StoreContext } from 'mobx/store-context';
import { CircularProgress } from '@material-ui/core';

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
	const store = useContext(StoreContext);
	const { vaults } = store.contracts;
	const { token } = props;

	// TODO: Add comment as to what is going on here?
	if (!token) return <CircularProgress style={{ float: 'left', marginRight: '.5rem' }} />;
	else {
		const prefix =
			!!vaults[token.contract] && !!vaults[token.contract].symbolPrefix
				? vaults[token.contract].symbolPrefix
				: '';
		return (
			<img
				alt=""
				className={classes.symbol}
				src={`assets/icons/${token.iconName}`}
			/>
		);
	}
});
