import { VaultBehavior, VaultDTO, VaultState, VaultType } from '@badger-dao/sdk';
import { Chip, Grid, GridProps, makeStyles, Typography } from '@material-ui/core';
import clsx from 'clsx';
import React, { MouseEvent } from 'react';

const useStyles = makeStyles((theme) => ({
  tag: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.primary.main,
    textTransform: 'capitalize',
  },
  label: {
    marginRight: 5,
  },
  clickableTag: {
    cursor: 'pointer',
  },
  clickableLabel: {
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}));

interface Props extends GridProps {
  vault: VaultDTO;
  showLabels?: boolean;
  onStatusClick?: (event: MouseEvent<HTMLElement>) => void;
  onRewardsClick?: (event: MouseEvent<HTMLElement>) => void;
}

const VaultListItemTags = ({
  vault,
  showLabels = false,
  onStatusClick,
  onRewardsClick,
  ...gridProps
}: Props): JSX.Element => {
  const classes = useStyles();
  return (
    <Grid container spacing={2} {...gridProps}>
      {vault.state !== VaultState.Open && (
        <Grid item xs="auto" onClick={onStatusClick}>
          {showLabels && (
            <Typography
              display="inline"
              variant={'caption'}
              className={clsx(classes.label, onStatusClick && classes.clickableLabel)}
            >
              Status:
            </Typography>
          )}
          <Chip size="small" label={vault.state} className={clsx(classes.tag, onStatusClick && classes.clickableTag)} />
        </Grid>
      )}
      <Grid item xs="auto">
        {showLabels && (
          <Typography display="inline" variant={'caption'} className={classes.label}>
            Platform:
          </Typography>
        )}
        <Chip size="small" label={vault.protocol} className={classes.tag} />
      </Grid>
      {vault.behavior !== VaultBehavior.None && (
        <Grid item xs="auto" onClick={onRewardsClick}>
          {showLabels && (
            <Typography
              display="inline"
              variant={'caption'}
              className={clsx(classes.label, onRewardsClick && classes.clickableLabel)}
            >
              Rewards:
            </Typography>
          )}
          <Chip
            size="small"
            label={vault.behavior}
            className={clsx(classes.tag, onRewardsClick && classes.clickableTag)}
          />
        </Grid>
      )}
      {vault.type === VaultType.Boosted && (
        <Grid item xs="auto">
          {showLabels && (
            <Typography display="inline" variant={'caption'} className={classes.label}>
              Boost:
            </Typography>
          )}
          <Chip size="small" label="🚀 Boosted" className={classes.tag} />
        </Grid>
      )}
    </Grid>
  );
};

export default VaultListItemTags;
