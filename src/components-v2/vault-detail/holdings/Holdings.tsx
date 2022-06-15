import React from 'react';
import { Grid, makeStyles, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import { HoldingItem } from './HoldingItem';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../../mobx/store-context';
import { HoldingsActionButtons } from './HoldingsActionButtons';
import { NoHoldings } from './NoHoldings';
import { TokenDistributionIcon } from './TokenDistributionIcon';
import { VaultDTO, VaultData } from '@badger-dao/sdk';
import { shouldDisplayEarnings } from 'utils/componentHelpers';
import { formatWithoutExtraZeros, numberWithCommas } from '../../../mobx/utils/helpers';
import { useVaultInformation } from 'hooks/useVaultInformation';

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
	vault: VaultDTO;
	userData: VaultData;
}

export const Holdings = observer(({ userData, vault }: Props): JSX.Element | null => {
	const { user, vaults } = React.useContext(StoreContext);
	const isMediumSizeScreen = useMediaQuery(useTheme().breakpoints.up('sm'));
	const classes = useStyles();
	const canDeposit = user.onGuestList(vault);
	const { depositBalance } = useVaultInformation(vault);

	if (depositBalance.tokenBalance.eq(0)) {
		return (
			<Grid container>
				<NoHoldings vault={vault} />
			</Grid>
		);
	}

	const { earnedBalance, earnedValue } = userData;
	const decimals = depositBalance.token.decimals;

	return (
		<Grid container>
			<Grid container>
				<Typography className={classes.settInfoTitle}>Your Vault Info</Typography>
			</Grid>
			<Grid container spacing={1} alignItems="center">
				<Grid item xs={12} sm>
					<HoldingItem
						vault={vault}
						name="Total Deposited"
						balance={depositBalance.balanceDisplay()}
						value={depositBalance.balanceValueDisplay(vaults.vaultsFilters.currency) ?? '0'}
						helpIcon={<TokenDistributionIcon settBalance={userData} />}
					/>
				</Grid>
				{shouldDisplayEarnings(vault, userData) && (
					<Grid item xs={12} sm>
						<HoldingItem
							vault={vault}
							name="Total Earned"
							balance={formatWithoutExtraZeros(earnedBalance, decimals)}
							value={`~$${numberWithCommas(formatWithoutExtraZeros(earnedValue, 2))}`}
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
