import React from 'react';
import { Grid, Tooltip } from '@material-ui/core';
import { HoldingItem } from './HoldingItem';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../../mobx/store-context';
import { SettBalance } from '../../../mobx/model/setts/sett-balance';
import { Sett } from '../../../mobx/model/setts/sett';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
	helpIcon: {
		fontSize: 16,
		marginLeft: theme.spacing(0.5),
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

		const { depositedBalance, earnedBalance, earnedValue, balance, value, withdrawnBalance } = settBalance;
		const principle = depositedBalance - withdrawnBalance;
		const tokenPrice = value / balance;
		const logo = `/assets/icons/${settBalance.asset.toLowerCase()}.png`;

		const depositToken = setts.getToken(sett.underlyingToken);
		const decimals = depositToken?.decimals || 18;

		let principleHelperInfo;

		if (principle < 0) {
			principleHelperInfo = (
				<Tooltip
					title="If your principle is negative it means that you've withdrawn more money than you've deposited"
					placement="top"
					arrow
				>
					<HelpOutlineIcon className={classes.helpIcon} />
				</Tooltip>
			);
		}

		return (
			<Grid container spacing={1}>
				<Grid item xs={12} sm>
					<HoldingItem name="Your Total" logo={logo} balance={balance} value={value} decimals={decimals} />
				</Grid>
				<Grid item xs={12} sm>
					<HoldingItem
						name="Principle"
						logo={logo}
						balance={principle}
						value={principle * tokenPrice}
						decimals={decimals}
						helpIcon={principleHelperInfo}
					/>
				</Grid>
				<Grid item xs={12} sm>
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
