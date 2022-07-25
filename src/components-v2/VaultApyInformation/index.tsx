import { VaultDTO } from '@badger-dao/sdk';
import {
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
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React, { MouseEvent, useContext } from 'react';

import routes from '../../config/routes';
import { numberWithCommas } from '../../mobx/utils/helpers';
import VaultApyBreakdownItem from '../VaultApyBreakdownItem';
import VaultListItemTags from '../VaultListItemTags';

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
  },
  content: {
    padding: '0px 36px 27px 36px',
  },
  button: {
    marginTop: 34,
  },
  projectedAPY: {
    paddingTop: 10,
  },
}));

interface Props {
  open: boolean;
  vault: VaultDTO;
  boost: number;
  onClose: () => void;
  projectedBoost: number | null;
}

const VaultApyInformation = ({ open, onClose, boost, vault, projectedBoost }: Props): JSX.Element => {
  const { vaults, router } = useContext(StoreContext);
  const classes = useStyles();
  const sources = vaults.vaultsFilters.showAPR ? vault.sources : vault.sourcesApy;
  //make sure boost sources are always the last one
  const sortedSources = sources.slice().sort((source) => (source.boostable ? 1 : -1));
  const badgerRewardsSources = sortedSources.filter((source) => source.name.includes('Badger Rewards'));

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
      <DialogTitle disableTypography className={classes.title}>
        <Grid container direction="column">
          <Grid item container justifyContent="space-between" alignItems="center">
            <Grid item xs="auto">
              <Typography variant="h5" display="inline">
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
      <DialogContent className={classes.content}>
        <Grid container direction="column">
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
            <React.Fragment key={source.name}>
              <VaultApyBreakdownItem vault={vault} source={source} />
              <Divider className={classes.divider} />
            </React.Fragment>
          ))}
          {projectedBoost !== null && (
            <>
              <Grid className={classes.projectedAPY} item container justifyContent="space-between">
                <Grid item>
                  <Typography variant="subtitle1" display="inline" color="textSecondary">
                    Projected {vaults.vaultsFilters.showAPR ? 'APR' : 'APY'}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="subtitle1" display="inline" color="textSecondary">
                    {`${numberWithCommas(projectedBoost.toFixed(2))}%`}
                  </Typography>
                </Grid>
              </Grid>
              <Divider className={classes.divider} />
              {vault.yieldProjection.harvestTokens.map((token) => (
                <div key={`yield-apr-${token.name}`}>
                  <Grid item container justifyContent="space-between">
                    <Grid item>
                      <Typography variant="body2" display="inline" color="textSecondary">
                        {token.name}
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Typography variant="body2" display="inline" color="textSecondary">
                        {`${numberWithCommas(token.apr.toFixed(2))}%`}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Divider className={classes.divider} />
                </div>
              ))}
              {badgerRewardsSources.map((source) => (
                <React.Fragment key={source.name}>
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
    </Dialog>
  );
};

export default observer(VaultApyInformation);
