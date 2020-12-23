import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
	symbol: {
		marginTop: 'auto',
		marginBottom: 'auto',
		padding: theme.spacing(1),

		float: 'left',
		width: '3.2rem'
	}

}));
export const VaultSymbol = observer((props: any) => {
	const classes = useStyles();

	const { symbol } = props

	if (!symbol)
		return <span />

	return <img alt=""
		className={classes.symbol}
		src={require(`../../assets/icons/${symbol.replace(/\/+/g, '').toLowerCase()}.png`)} />


});

