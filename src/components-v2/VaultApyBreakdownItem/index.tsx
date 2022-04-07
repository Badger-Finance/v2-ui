import React, { useContext } from 'react';
import { ValueSource, VaultDTO } from '@badger-dao/sdk';
import { Grid, Link, makeStyles, Typography } from '@material-ui/core';
import { numberWithCommas } from '../../mobx/utils/helpers';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import { useVaultInformation } from '../../hooks/useVaultInformation';
import routes from '../../config/routes';

const useStyles = makeStyles({
	apyBreakdownIcon: {
		marginRight: 8,
	},
	myBoost: {
		marginTop: 9,
	},
	calculatorLink: {
		marginLeft: 8,
	},
	link: {
		cursor: 'pointer',
	},
});

interface Props {
	vault: VaultDTO;
	source: ValueSource;
	multiplier: number;
}

const VaultApyBreakdownItem = ({ vault, source, multiplier }: Props): JSX.Element => {
	const classes = useStyles();
	const { vaults, user, router } = useContext(StoreContext);
	const { boostContribution } = useVaultInformation(vault);

	// this is only possible because we're currently distributing BADGER. If in the future we distribute other tokens,
	// this will need to be updated to reflect that.
	const isBoostBreakdown = source.name === 'Boosted Badger Rewards';
	const sourceApr = source.boostable ? source.apr * multiplier : source.apr;
	const maxReward = vaults.vaultsFilters.showAPR ? vault.maxApr : vault.maxApy;
	const boostMultiplier = user.accountDetails?.boost;

	const handleGoToCalculator = async () => {
		await router.goTo(routes.boostOptimizer);
	};

	if (isBoostBreakdown && vault.boost.enabled && maxReward) {
		return (
			<Grid item container direction="column">
				<Grid item container justifyContent="space-between">
					<Grid item>
						<Typography variant="body2" display="inline" color="textSecondary">
							{`🚀 Boosted BADGER Rewards (max: ${numberWithCommas(maxReward.toFixed(2))}%)`}
						</Typography>
					</Grid>
					<Grid item>
						<Typography variant="body2" display="inline" color="textSecondary">
							{`${numberWithCommas(sourceApr.toFixed(2))}%`}
						</Typography>
					</Grid>
				</Grid>
				{!!boostMultiplier && !!boostContribution && (
					<Grid item container>
						<img
							className={classes.apyBreakdownIcon}
							src="/assets/icons/apy-breakdown-icon.svg"
							alt="apy breakdown icon"
						/>
						<Typography variant="body2" display="inline" color="textSecondary">
							{`My Boost: ${boostMultiplier}x`}
						</Typography>
						<Link color="primary" onClick={handleGoToCalculator} className={classes.link}>
							<Typography
								variant="body2"
								display="inline"
								color="inherit"
								className={classes.calculatorLink}
							>
								Go To Boost
							</Typography>
						</Link>
					</Grid>
				)}
			</Grid>
		);
	}

	return (
		<Grid item container justifyContent="space-between">
			<Grid item>
				<Typography variant="body2" display="inline" color="textSecondary">
					{source.name}
				</Typography>
			</Grid>
			<Grid item>
				<Typography variant="body2" display="inline" color="textSecondary">
					{`${numberWithCommas(sourceApr.toFixed(2))}%`}
				</Typography>
			</Grid>
		</Grid>
	);
};

export default observer(VaultApyBreakdownItem);
