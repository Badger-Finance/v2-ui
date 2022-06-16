import { ValueSource, VaultDTO } from '@badger-dao/sdk';
import { Grid, Link, makeStyles, Typography } from '@material-ui/core';
import { MAX_BOOST_RANK } from 'config/system/boost-ranks';
import { observer } from 'mobx-react-lite';
import React, { useContext } from 'react';
import { calculateUserBoost } from 'utils/boost-ranks';

import routes from '../../config/routes';
import { useVaultInformation } from '../../hooks/useVaultInformation';
import { StoreContext } from '../../mobx/store-context';
import { numberWithCommas } from '../../mobx/utils/helpers';

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
}

const VaultApyBreakdownItem = ({ vault, source }: Props): JSX.Element => {
	const classes = useStyles();
	const { user, router } = useContext(StoreContext);
	const { boostContribution } = useVaultInformation(vault);

	// this is only possible because we're currently distributing BADGER. If in the future we distribute other tokens,
	// this will need to be updated to reflect that.
	const isBoostBreakdown = source.name === 'Boosted Badger Rewards';
	const maxBoost = calculateUserBoost(MAX_BOOST_RANK.stakeRatioBoundary);
	const boostMultiplier = user.accountDetails?.boost ?? 1;
	const sourceApr = source.boostable
		? source.minApr + (source.maxApr - source.minApr) * (boostMultiplier / maxBoost)
		: source.apr;

	const handleGoToCalculator = async () => {
		await router.goTo(routes.boostOptimizer);
	};

	if (isBoostBreakdown && vault.boost.enabled) {
		return (
			<Grid item container direction="column">
				<Grid item container justifyContent="space-between">
					<Grid item>
						<Typography variant="body2" display="inline" color="textSecondary">
							{`🚀 Boosted BADGER Rewards (max: ${numberWithCommas(source.maxApr.toFixed(2))}%)`}
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
