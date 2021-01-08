import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';
import { CircularProgress } from '@material-ui/core';
import { StoreContext } from '../../context/store-context';

const useStyles = makeStyles((theme) => ({
	symbol: {
		marginTop: 'auto',
		marginBottom: 'auto',
		padding: theme.spacing(1.2, 1, 0, 0),
		display: 'inline-block',
		float: 'left',
		width: '2.4rem'
	}

}));
export const VaultSymbol = observer((props: any) => {
	const classes = useStyles();
	const store = useContext(StoreContext);
	const { tokens, vaults } = store.contracts

	const { token } = props

	let prefix = !!vaults[token.contract] && !!vaults[token.contract].symbolPrefix ? vaults[token.contract].symbolPrefix : ''
	// let underlying = tokens[vault[vault.underlyingKey]]
	if (!token || !token.symbol)
		return <CircularProgress />


	return <img alt=""
		className={classes.symbol}
		src={require(`../../assets/icons/${prefix}${token.symbol.replace(/^[b]/g, '').replace(/\/+/g, '').toLowerCase()}.png`)} />

});

