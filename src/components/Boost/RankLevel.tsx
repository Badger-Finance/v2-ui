import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Typography } from '@material-ui/core';
import { BadgerBoostImage } from './BadgerBoostImage';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
  root: {
    textAlign: 'start',
  },
  fullWidthImage: {
    width: '100%',
    height: '100%',
  },
  badgerLevelInfoContainer: {
    margin: 'auto 0px',
  },
  badgerLevelBoost: {
    fontSize: 10,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.black,
    padding: 2,
  },
  boostImage: {
    width: '60%',
  },
  boostImageContainer: {
    width: 40,
    height: 40,
    margin: '12px 8px 6px 0px',
  },
  locked: {
    opacity: 0.5,
  },
  badgerLevelConnector: {
    width: 5,
    height: 2,
    marginLeft: 2,
    marginRight: 8,
    background: 'rgba(255, 255, 255, 0.1)',
  },
  softBorder: {
    borderRadius: 2,
  },
  obtained: {
    border: `2px solid ${theme.palette.primary.main}`,
  },
}));

interface Props {
  name: string;
  signatureColor: string;
  obtained?: boolean;
  hasBeenReached?: boolean;
}

export const RankLevel = ({ name, signatureColor, obtained = false, hasBeenReached = true }: Props): JSX.Element => {
  const classes = useStyles();

  return (
    <Grid container className={clsx(!hasBeenReached && classes.locked, classes.root)}>
      <div className={clsx(classes.boostImageContainer)}>
        <BadgerBoostImage
          className={clsx(classes.softBorder, obtained && classes.obtained)}
          signatureColor={signatureColor}
        />
      </div>
      <div className={classes.badgerLevelInfoContainer}>
        <Typography variant="body2">{name}</Typography>
      </div>
    </Grid>
  );
};
