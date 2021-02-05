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

	if (token && token.symbol) {
		const prefix =
			!!vaults[token.contract] && !!vaults[token.contract].symbolPrefix
				? vaults[token.contract].symbolPrefix
				: '';
		// let underlying = tokens[vault[vault.underlyingKey]]
		if (!token || !token.symbol) return <CircularProgress style={{ float: 'left', marginRight: '.5rem' }} />;

		return (
			<img
				alt=""
				className={classes.symbol}
				src={require(`../../assets/icons/${prefix}${token.symbol
					.replace(/^[b]/g, '')
					.replace(/\/+/g, '')
					.toLowerCase()}.png`)}
			/>
		);
	}
	return <img alt="" className={classes.symbol} src={require(`../../assets/icons/${token}.png`)} />;
});
