import { VaultDTO } from '@badger-dao/sdk';
import { Box, Grid, Link, makeStyles, Theme, Typography } from '@material-ui/core';
import TokenLogo from 'components-v2/TokenLogo';
import { YieldValueSource } from 'components-v2/VaultApyInformation';
import { getYieldBearingVaultBySourceName } from 'components-v2/YieldBearingVaults/YieldBearingVaultUtil';
import { FLAGS } from 'config/environment';
import { MAX_BOOST_RANK } from 'config/system/boost-ranks';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React, { useContext } from 'react';
import { calculateUserBoost } from 'utils/boost-ranks';
import { isFlywheelSource } from 'utils/componentHelpers';
import { BoostedRewards } from 'utils/enums/boosted-rewards.enum';

import routes from '../../config/routes';
import { useVaultInformation } from '../../hooks/useVaultInformation';
import { numberWithCommas } from '../../mobx/utils/helpers';

const useStyles = makeStyles((theme: Theme) => ({
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
  totalVaultRewardsRow: {
    padding: 10,
    '& .MuiBox-root > *': {
      marginRight: 5,
    },
    '& .MuiBox-root > img': {
      marginRight: 10,
    },
  },
  earnedAs: { color: 'rgba(255,255,255,0.6)' },
  yieldSourceRow: {
    [theme.breakpoints.down('sm')]: {
      flexWrap: 'wrap',
    },
  },
}));

interface Props {
  vault: VaultDTO;
  source: YieldValueSource;
}

const VaultApyBreakdownItem = ({ vault, source }: Props): JSX.Element => {
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

  const handleLinkClick = () => {
    const config = getYieldBearingVaultBySourceName(source.name);
    if (config) {
      router.goTo(routes.vaultDetail, { vaultName: config.route }, { chain: router.queryParams?.chain });
    }
  };

  const handleGoToCalculator = async () => {
    await router.goTo(routes.boostOptimizer);
  };

  if (FLAGS.APY_EVOLUTION) {
    if (isBoostBreakdown && vault.boost.enabled) {
      return (
        <>
          <Grid container className={classes.totalVaultRewardsRow}>
            <Grid item xs={9}>
              <Box display="flex" alignItems="center">
                <TokenLogo
                  width="24"
                  height="24"
                  token={{ symbol: source.yieldVault ? source.yieldVault.token : source.name }}
                />
                <Typography component="span">{`🚀 Boosted BADGER Rewards (max: ${numberWithCommas(
                  source.maxApr.toFixed(2),
                )}%)`}</Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Typography align="right">{`${numberWithCommas(sourceApr.toFixed(2))}%`}</Typography>
            </Grid>
          </Grid>
        </>
      );
    }

    return (
      <>
        <Grid container className={classes.totalVaultRewardsRow}>
          <Grid item xs={9}>
            <Box display="flex" alignItems="center" className={classes.yieldSourceRow}>
              <TokenLogo
                width="24"
                height="24"
                token={{ symbol: source.yieldVault ? source.yieldVault.token : source.name }}
              />
              {!isFlywheelSource(source) ? (
                <>
                  <Typography component="span">{source.yieldVault ? source.yieldVault.token : source.name}</Typography>
                  {source.yieldVault && (
                    <>
                      <Typography component="span" className={classes.earnedAs}>
                        earned as
                      </Typography>
                      <img
                        width="12"
                        height="16"
                        src="/assets/icons/yield-bearing-rewards.svg"
                        alt="Yield-Bearing Rewards"
                      />
                      {source.yieldVault ? (
                        <Link display="inline" className={classes.link} onClick={handleLinkClick}>
                          <Typography component="span" color="primary">
                            {source.yieldVault.vaultName}
                          </Typography>
                        </Link>
                      ) : (
                        <Typography component="span" color="primary">
                          {source.name}
                        </Typography>
                      )}
                    </>
                  )}
                </>
              ) : (
                //  showing source `Vault Flywheel` as Compounding of Yield-Bearing Rewards
                <>
                  <Typography component="span">Compounding</Typography>
                  <Typography component="span" className={classes.earnedAs}>
                    of
                  </Typography>
                  <img
                    width="12"
                    height="16"
                    src="/assets/icons/yield-bearing-rewards.svg"
                    alt="Yield-Bearing Rewards"
                  />
                  <Typography component="span" color="primary">
                    Yield-Bearing Rewards
                  </Typography>
                </>
              )}
            </Box>
          </Grid>
          <Grid item xs={3}>
            <Typography align="right">{numberWithCommas(source.apr.toFixed(2))}%</Typography>
          </Grid>
        </Grid>
      </>
    );
  }

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

export default observer(VaultApyBreakdownItem);
