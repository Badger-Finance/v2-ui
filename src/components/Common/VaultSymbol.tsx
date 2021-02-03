import React from 'react';
import { observer } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';

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
	const { token } = props;
	return <img alt="" className={classes.symbol} src={require(`../../assets/icons/${token}.png`)} />;
});
