import React from 'react';
import { Grid } from '@material-ui/core';
import { HoldingItem } from './HoldingItem';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../../mobx/store-context';
import { SettBalance } from '../../../mobx/model/setts/sett-balance';
import { Sett } from '../../../mobx/model/setts/sett';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
	helpIcon: {
		fontSize: 16,
		marginLeft: theme.spacing(0.5),
	},
	item: {
		marginBottom: theme.spacing(1),
		wordBreak: 'break-all',
	},
}));

interface Props {
	sett: Sett;
	settBalance: SettBalance;
}

export const Holdings = observer(
	({ settBalance, sett }: Props): JSX.Element => {
		const { setts } = React.useContext(StoreContext);
		const classes = useStyles();

		const { earnedBalance, earnedValue, balance, value } = settBalance;
		const logo = `/assets/icons/${settBalance.asset.toLowerCase()}.png`;
		const depositToken = setts.getToken(sett.underlyingToken);
		const decimals = depositToken?.decimals || 18;

		return (
			<Grid container>
				<Grid container className={classes.item}>
					<HoldingItem name="Your Total" logo={logo} balance={balance} value={value} decimals={decimals} />
				</Grid>
				<Grid container className={classes.item}>
					<HoldingItem
						name="Earned"
						logo={logo}
						balance={earnedBalance}
						value={earnedValue}
						decimals={decimals}
					/>
				</Grid>
			</Grid>
		);
	},
);
