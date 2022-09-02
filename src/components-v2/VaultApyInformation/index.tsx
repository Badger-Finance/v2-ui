import { VaultDTO, VaultState } from '@badger-dao/sdk';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  makeStyles,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { isInfluenceVault } from 'components-v2/InfluenceVault/InfluenceVaultUtil';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React, { MouseEvent, useContext } from 'react';
import { isBadgerSource } from 'utils/componentHelpers';

import routes from '../../config/routes';
import { numberWithCommas } from '../../mobx/utils/helpers';
import VaultApyBreakdownItem from '../VaultApyBreakdownItem';
import VaultListItemTags from '../VaultListItemTags';
import { FLAGS } from 'config/environment';
import VaultLogo from 'components-v2/landing/VaultLogo';

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 516,
  },
  tag: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.primary.main,
    textTransform: 'capitalize',
  },
  closeIcon: {
    marginRight: -12,
  },
  divider: {
    width: '100%',
    margin: '9px 0px',
  },
  title: {
    padding: '27px 36px 36px 36px',
    '& h2': {
      fontSize: 20,
    },
  },
  content: {
    padding: '0px 36px 27px 36px',
  },
  button: {
    marginTop: 34,
  },
  historicAPY: {
    paddingBottom: 10,
  },
  // Yield Baring Rewards
  diaglogTitle: {
    padding: theme.spacing(2.5, 2.5, 0, 2.5),
  },
  totalVaultRewardsContainer: {
    padding: 20,
  },
  totalVaultRewards: {
    background: '#1B1B1B',
    borderRadius: 10,
  },
  totalVaultRewardsRow: {
    padding: 10,
    '& .MuiBox-root > *': {
      marginRight: 5,
    },
  },
  rowAsHead: {
    '& h3, & p': {
      fontSize: 20,
      fontWeight: 500,
    },
    '& span': {
      color: 'rgba(255,255,255,0.6)',
    },
  },
  earnedAs: { color: 'rgba(255,255,255,0.6)' },
  rowAsNote: { linrHeight: 10 },
  totalVaultRewardsDivider: {
    margin: 0,
  },
  yieldBearingRewards: {
    background: '#1B1B1B',
    marginTop: 20,
    borderRadius: 10,
  },
}));

interface Props {
  open: boolean;
  vault: VaultDTO;
  boost: number;
  onClose: () => void;
  projectedBoost: number | null;
}

interface YieldSourceDisplay {
  name: string;
  apr: number;
}

const VaultApyInformation = ({ open, onClose, boost, vault, projectedBoost }: Props): JSX.Element | null => {
  const {
    yieldProjection: { harvestPeriodSources, harvestPeriodSourcesApy, nonHarvestSources, nonHarvestSourcesApy },
    sources,
    sourcesApy,
  } = vault;
  const { vaults, router } = useContext(StoreContext);
  const {
    vaultsFilters: { showAPR },
  } = vaults;

  const classes = useStyles();
  const displaySources = showAPR ? sources : sourcesApy;
  const sortedSources = displaySources.slice().sort((a, b) => (isBadgerSource(b) ? -1 : b.apr > a.apr ? 1 : -1));
  const badgerRewardsSources = sortedSources.filter(isBadgerSource);
  const harvestSources: YieldSourceDisplay[] = showAPR ? harvestPeriodSources : harvestPeriodSourcesApy;
  const additionalSources: YieldSourceDisplay[] = showAPR ? nonHarvestSources : nonHarvestSourcesApy;
  const totalCurrentSources = harvestSources.concat(additionalSources);
  const isNewVault = vault.state === VaultState.Experimental || vault.state === VaultState.Guarded;
  const isInfluence = isInfluenceVault(vault.vaultToken);

  const handleGoToVault = async (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    await router.goTo(routes.vaultDetail, {
      vaultName: vaults.getSlug(vault.vaultToken),
    });
  };

  const handleClose = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClick={(e) => e.stopPropagation()}
      onClose={onClose}
      fullWidth
      classes={{ paper: classes.root }}
    >
      <DialogTitle disableTypography className={`${classes.title} ${FLAGS.APY_EVOLUTION && classes.diaglogTitle}`}>
        <Grid container direction="column">
          <Grid item container justifyContent="space-between" alignItems="center">
            <Grid item xs="auto">
              <Typography variant="h2" display="inline">
                {vault.name}
              </Typography>
            </Grid>
            <Grid item xs="auto">
              <IconButton onClick={handleClose} className={classes.closeIcon}>
                <CloseIcon />
              </IconButton>
            </Grid>
          </Grid>
          <Grid item container>
            <VaultListItemTags vault={vault} spacing={1} />
          </Grid>
        </Grid>
      </DialogTitle>
      {!FLAGS.APY_EVOLUTION && (
        <DialogContent className={classes.content}>
          <Grid container direction="column">
            {!isNewVault && (
              <div className={classes.historicAPY}>
                <Grid item container justifyContent="space-between">
                  <Grid item>
                    <Typography variant="subtitle1" display="inline" color="textSecondary">
                      Historic {vaults.vaultsFilters.showAPR ? 'APR' : 'APY'}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="subtitle1" display="inline" color="textSecondary">
                      {`${numberWithCommas(boost.toFixed(2))}%`}
                    </Typography>
                  </Grid>
                </Grid>
                <Divider className={classes.divider} />
                {sortedSources.map((source) => (
                  <React.Fragment key={`historic-${source.name}`}>
                    <VaultApyBreakdownItem vault={vault} source={source} />
                    <Divider className={classes.divider} />
                  </React.Fragment>
                ))}
              </div>
            )}
            {!isInfluence && projectedBoost !== null && (
              <>
                <Grid item container justifyContent="space-between">
                  <Grid item>
                    <Typography variant="subtitle1" display="inline" color="textSecondary">
                      Current {vaults.vaultsFilters.showAPR ? 'APR' : 'APY'}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="subtitle1" display="inline" color="textSecondary">
                      {`${numberWithCommas(projectedBoost.toFixed(2))}%`}
                    </Typography>
                  </Grid>
                </Grid>
                <Divider className={classes.divider} />
                {totalCurrentSources.map((token) => (
                  <div key={`yield-apr-${token.name}`}>
                    <Grid item container justifyContent="space-between">
                      <Grid item>
                        <Typography variant="body2" display="inline" color="textSecondary">
                          {token.name}
                        </Typography>
                      </Grid>
                      <Grid item>
                        <Typography variant="body2" display="inline" color="textSecondary">
                          {token?.apr && `${numberWithCommas(token.apr.toFixed(2))}%`}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Divider className={classes.divider} />
                  </div>
                ))}
                {badgerRewardsSources.map((source) => (
                  <React.Fragment key={`current-${source.name}`}>
                    <VaultApyBreakdownItem vault={vault} source={source} />
                    <Divider className={classes.divider} />
                  </React.Fragment>
                ))}
              </>
            )}
            <Grid item className={classes.button}>
              <Button color="primary" variant="contained" fullWidth onClick={handleGoToVault}>
                GO TO VAULT
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
      )}

      {/* Yield Bearing Rewards */}
      {FLAGS.APY_EVOLUTION && (
        <DialogContent className={classes.totalVaultRewardsContainer}>
          <Box className={classes.totalVaultRewards}>
            <Grid container className={`${classes.totalVaultRewardsRow} ${classes.rowAsHead}`}>
              <Grid item xs={6}>
                <Typography component="h3">Total Vault Rewards</Typography>
              </Grid>
              <Grid item xs={6}>
                <Box display="flex" justifyContent="flex-end" alignItems="center">
                  {isNewVault && (
                    <>
                      <img width="12" src="assets/icons/new-vault.svg" alt="New Vault" />
                      <Typography component="span">New Vault</Typography>
                    </>
                  )}
                  <Typography>84.95%</Typography>
                </Box>
              </Grid>
            </Grid>
            <Divider className={classes.totalVaultRewardsDivider} />
            <Grid container className={`${classes.totalVaultRewardsRow} ${classes.rowAsNote}`}>
              <Grid item>Rewards earned by our strategies on your vault deposits</Grid>
            </Grid>
            <Divider className={classes.totalVaultRewardsDivider} />
            <Grid container className={classes.totalVaultRewardsRow}>
              <Grid item xs={9}>
                <Typography> LP Fees</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography align="right">0.63%</Typography>
              </Grid>
            </Grid>
            <Divider className={classes.totalVaultRewardsDivider} />
            <Grid container className={classes.totalVaultRewardsRow}>
              <Grid item xs={9}>
                <Box display="flex" alignItems="center">
                  <Typography component="span"> AURA </Typography>
                  <Typography component="span" className={classes.earnedAs}>
                    earned as
                  </Typography>
                  <img
                    width="12"
                    height="16"
                    src="assets/icons/yield-bearing-rewards.svg"
                    alt="Yield-Bearing Rewards"
                  />
                  <Typography component="span" color="primary">
                    graviAURA
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Typography align="right">0.63%</Typography>
              </Grid>
            </Grid>
            <Divider className={classes.totalVaultRewardsDivider} />
            <Grid container className={classes.totalVaultRewardsRow}>
              <Grid item xs={9}>
                <Box display="flex" alignItems="center">
                  <Typography component="span"> BAL </Typography>
                  <Typography component="span" className={classes.earnedAs}>
                    earned as
                  </Typography>
                  <img
                    width="12"
                    height="16"
                    src="assets/icons/yield-bearing-rewards.svg"
                    alt="Yield-Bearing Rewards"
                  />
                  <Typography component="span" color="primary">
                    bauraBAL
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Typography align="right">0.63%</Typography>
              </Grid>
            </Grid>
          </Box>

          <Box className={classes.yieldBearingRewards}>
            <Grid container className={`${classes.totalVaultRewardsRow} ${classes.rowAsHead}`}>
              <Grid item xs={12}>
                <Box display="flex" alignItems="center">
                  <img
                    width="15"
                    height="20"
                    src="assets/icons/yield-bearing-rewards.svg"
                    alt="Yield-Bearing Rewards"
                  />
                  <Typography component="h3" color="primary">
                    Yield-Bearing Rewards
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            <Divider className={classes.totalVaultRewardsDivider} />
            <Grid container className={`${classes.totalVaultRewardsRow} ${classes.rowAsNote}`}>
              <Grid item>These rewards continue earning rewards of their own, no claiming required </Grid>
            </Grid>
            <Divider className={classes.totalVaultRewardsDivider} />
            <Grid container className={classes.totalVaultRewardsRow}>
              <Grid item xs={9}>
                <Box display="flex" alignItems="center">
                  <img
                    width="12"
                    height="16"
                    src="assets/icons/yield-bearing-rewards.svg"
                    alt="Yield-Bearing Rewards"
                  />
                  <Typography component="span" color="primary">
                    graviAURA
                  </Typography>
                  <Typography component="span" className={classes.earnedAs}>
                    is
                  </Typography>
                  <Typography component="span"> Yield-Bearing Locked AURA </Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Typography align="right">0.63%</Typography>
              </Grid>
            </Grid>
            <Divider className={classes.totalVaultRewardsDivider} />
            <Grid container className={classes.totalVaultRewardsRow}>
              <Grid item xs={9}>
                <Box display="flex" alignItems="center">
                  <img
                    width="12"
                    height="16"
                    src="assets/icons/yield-bearing-rewards.svg"
                    alt="Yield-Bearing Rewards"
                  />
                  <Typography component="span" color="primary">
                    bauraBAL
                  </Typography>
                  <Typography component="span" className={classes.earnedAs}>
                    is
                  </Typography>
                  <Typography component="span"> Yield-Bearing Staked auraBAL </Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Typography align="right">0.63%</Typography>
              </Grid>
            </Grid>
          </Box>

          <Grid item className={classes.button}>
            <Button color="primary" variant="contained" fullWidth onClick={handleGoToVault}>
              GO TO VAULT
            </Button>
          </Grid>
        </DialogContent>
      )}
      {/* Yield Bearing Rewards */}
    </Dialog>
  );
};

export default observer(VaultApyInformation);
