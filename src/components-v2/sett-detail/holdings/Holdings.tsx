import React from 'react';
import { Grid, makeStyles, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import { HoldingItem } from './HoldingItem';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../../mobx/store-context';
import { SettBalance } from '../../../mobx/model/setts/sett-balance';
import { Sett } from '../../../mobx/model/setts/sett';
import { HoldingsActionButtons } from './HoldingsActionButtons';
import { NoHoldings } from './NoHoldings';
import { BadgerSett } from '../../../mobx/model/vaults/badger-sett';
import { TokenBalance } from 'mobx/model/tokens/token-balance';
import { hasBalance } from '../utils';

const useStyles = makeStyles(() => ({
	settInfoTitle: {
		fontSize: 24,
		fontWeight: 500,
	},
}));

interface Props {
	sett: Sett;
	badgerSett: BadgerSett;
	tokenBalance: TokenBalance;
	settBalance: SettBalance;
}

export const Holdings = observer(
	({ tokenBalance, settBalance, sett, badgerSett }: Props): JSX.Element => {
		const { setts } = React.useContext(StoreContext);
		const isMediumSizeScreen = useMediaQuery(useTheme().breakpoints.up('sm'));
		const classes = useStyles();

		if (!hasBalance(settBalance) && !TokenBalance.hasBalance(tokenBalance)) {
			return (
				<Grid container>
					<NoHoldings sett={sett} badgerSett={badgerSett} />
				</Grid>
			);
		}

		const { earnedBalance, earnedValue, balance, value } = settBalance;
		const logo = `/assets/icons/${sett.asset.toLowerCase()}.png`;

		const depositToken = setts.getToken(sett.underlyingToken);
		const decimals = depositToken?.decimals || 18;

		return (
			<Grid container>
				<Grid container>
					<Typography className={classes.settInfoTitle}>Your Vault Info</Typography>
				</Grid>
				<Grid container spacing={1}>
					<Grid item xs={12} sm>
						<HoldingItem
							name="Total Balance"
							logo={logo}
							balance={balance}
							value={value}
							decimals={decimals}
						/>
					</Grid>
					<Grid item xs={12} sm>
						<HoldingItem
							name="Total Earned"
							logo={logo}
							balance={earnedBalance}
							value={earnedValue}
							decimals={decimals}
						/>
					</Grid>
					{isMediumSizeScreen && (
						<Grid item xs={12} sm>
							<HoldingsActionButtons />
						</Grid>
					)}
				</Grid>
			</Grid>
		);
	},
);
