import { VaultDTOV3 } from '@badger-dao/sdk';
import { Box, Grid, Link, makeStyles, Theme, Typography } from '@material-ui/core';
import MissingValueSkeleton from 'components-v2/common/MissingValueSkeleton';
import TokenLogo from 'components-v2/TokenLogo';
import { YieldValueSource } from 'components-v2/VaultApyInformation';
import { getYieldBearingVaultBySourceName } from 'components-v2/YieldBearingVaults/YieldBearingVaultUtil';
import { MAX_BOOST_RANK } from 'config/system/boost-ranks';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React, { useContext } from 'react';
import { calculateUserBoost } from 'utils/boost-ranks';
import { isFlywheelSource } from 'utils/componentHelpers';
import { BoostedRewards } from 'utils/enums/boosted-rewards.enum';

import routes from '../../config/routes';
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
      '&:last-child': {
        marginRight: 0,
      },
    },
    '& .MuiBox-root > img:first-child': {
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
  vault: VaultDTOV3;
  source: YieldValueSource;
}

const VaultApyBreakdownItem = ({ vault, source }: Props): JSX.Element => {
  const classes = useStyles();
  const { user, router } = useContext(StoreContext);

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
              <Typography component="span">
                🚀 Boosted BADGER Rewards (max:{' '}
                {source.maxApr ? numberWithCommas(source.maxApr?.toFixed(2)) : <MissingValueSkeleton />}%)
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={3}>
            <Typography align="right">
              {sourceApr ? numberWithCommas(sourceApr?.toFixed(2)) : <MissingValueSkeleton />}%
            </Typography>
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
                <img width="12" height="16" src="/assets/icons/yield-bearing-rewards.svg" alt="Yield-Bearing Rewards" />
                <Typography component="span" color="primary">
                  Yield-Bearing Rewards
                </Typography>
              </>
            )}
          </Box>
        </Grid>
        <Grid item xs={3}>
          <Typography align="right">
            {source.apr ? numberWithCommas(source.apr?.toFixed(2)) : <MissingValueSkeleton />}%
          </Typography>
        </Grid>
      </Grid>
    </>
  );
};

export default observer(VaultApyBreakdownItem);
