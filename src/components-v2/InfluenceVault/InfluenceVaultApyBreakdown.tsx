import { VaultDTO } from '@badger-dao/sdk';
import { Grid, Link, makeStyles, Typography } from '@material-ui/core';
import { MAX_BOOST_RANK } from 'config/system/boost-ranks';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import { useContext } from 'react';
import { calculateUserBoost } from 'utils/boost-ranks';
import { BoostedRewards } from 'utils/enums/boosted-rewards.enum';

import routes from '../../config/routes';
import { useVaultInformation } from '../../hooks/useVaultInformation';
import { numberWithCommas } from '../../mobx/utils/helpers';
import { YieldValueSource } from 'components-v2/VaultApyInformation';

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
  }
});

interface Props {
  vault: VaultDTO;
  source: YieldValueSource;
}

const InfluenceVaultApyBreakdown = ({ vault, source }: Props): JSX.Element => {
  const classes = useStyles();
  const { user, router } = useContext(StoreContext);
  const { boostContribution } = useVaultInformation(vault);

  // this is only possible because we're currently distributing BADGER. If in the future we distribute other tokens,
  // this will need to be updated to reflect that.
  const isBoostBreakdown = source.name === BoostedRewards.BoostedBadger;
  const maxBoost = calculateUserBoost(MAX_BOOST_RANK.stakeRatioBoundary);
  const userBoost = user.accountDetails?.boost ?? 1;
  const sourceApr = source.boostable
    ? source.minApr + (source.maxApr - source.minApr) * (userBoost / maxBoost)
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
        {!!userBoost && !!boostContribution && (
          <Grid item container>
            <img
              className={classes.apyBreakdownIcon}
              src="/assets/icons/apy-breakdown-icon.svg"
              alt="apy breakdown icon"
            />
            <Typography variant="body2" display="inline" color="textSecondary">
              {`My Boost: ${userBoost}x`}
            </Typography>
            <Link color="primary" onClick={handleGoToCalculator} className={classes.link}>
              <Typography variant="body2" display="inline" color="inherit" className={classes.calculatorLink}>
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

export default observer(InfluenceVaultApyBreakdown);
