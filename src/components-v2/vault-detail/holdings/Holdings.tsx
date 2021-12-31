import React from 'react';
import { Grid, makeStyles, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import { HoldingItem } from './HoldingItem';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../../mobx/store-context';
import { HoldingsActionButtons } from './HoldingsActionButtons';
import { NoHoldings } from './NoHoldings';
import { BadgerVault } from '../../../mobx/model/vaults/badger-vault';
import { TokenBalance } from 'mobx/model/tokens/token-balance';
import { hasBalance } from '../utils';
import { TokenDistributionIcon } from './TokenDistributionIcon';
import { Vault, VaultData } from '@badger-dao/sdk';
import { shouldDisplayEarnings } from 'utils/componentHelpers';

const useStyles = makeStyles((theme) => ({
	settInfoTitle: {
		fontSize: 24,
		fontWeight: 500,
	},
	helpIcon: {
		fontSize: 16,
		marginLeft: theme.spacing(0.5),
		color: 'rgba(255, 255, 255, 0.3)',
	},
}));

interface Props {
	vault: Vault;
	badgerVault: BadgerVault;
	tokenBalance: TokenBalance;
	userData: VaultData;
}

export const Holdings = observer(({ tokenBalance, userData, vault, badgerVault }: Props): JSX.Element | null => {
	const { vaults, user } = React.useContext(StoreContext);
	const isMediumSizeScreen = useMediaQuery(useTheme().breakpoints.up('sm'));
	const classes = useStyles();
	const canDeposit = user.onGuestList(vault);

	if (!hasBalance(userData) && !TokenBalance.hasBalance(tokenBalance)) {
		return (
			<Grid container>
				<NoHoldings vault={vault} badgerVault={badgerVault} />
			</Grid>
		);
	}

	const { earnedBalance, earnedValue, balance, value } = userData;
	const logo = `/assets/icons/${vault.vaultAsset.toLowerCase()}.png`;

	const depositToken = vaults.getToken(vault.underlyingToken);
	const decimals = depositToken?.decimals || 18;

	return (
		<Grid container>
			<Grid container>
				<Typography className={classes.settInfoTitle}>Your Vault Info</Typography>
			</Grid>
			<Grid container spacing={1}>
				<Grid item xs={12} sm>
					<HoldingItem
						name="Total Deposited"
						logo={logo}
						balance={balance}
						value={value}
						decimals={decimals}
						helpIcon={<TokenDistributionIcon settBalance={userData} />}
					/>
				</Grid>
				{shouldDisplayEarnings(vault, userData) && (
					<Grid item xs={12} sm>
						<HoldingItem
							name="Total Earned"
							logo={logo}
							balance={earnedBalance}
							value={earnedValue}
							decimals={decimals}
						/>
					</Grid>
				)}
				{isMediumSizeScreen && (
					<Grid item xs={12} sm>
						<HoldingsActionButtons canDeposit={canDeposit} />
					</Grid>
				)}
			</Grid>
		</Grid>
	);
});
