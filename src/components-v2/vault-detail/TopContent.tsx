import { VaultDTOV3, VaultState } from '@badger-dao/sdk';
import { Grid, makeStyles } from '@material-ui/core';

import VaultDeprecationWarning from '../VaultDeprecationWarning';
import { Breadcrumb } from './Breadcrumb';
import { Description } from './description/Description';

const useStyles = makeStyles((theme) => ({
  root: {
    marginBottom: theme.spacing(4),
    [theme.breakpoints.down('sm')]: {
      marginBottom: theme.spacing(2),
    },
  },
  descriptionSection: {
    justifyContent: 'space-between',
  },
  breadcrumbContainer: {
    marginBottom: theme.spacing(1),
  },
}));

interface Props {
  vault: VaultDTOV3;
}

export const TopContent = ({ vault }: Props): JSX.Element => {
  const classes = useStyles();
  return (
    <Grid container className={classes.root}>
      <Grid item container xs>
        <Grid container className={classes.breadcrumbContainer}>
          <Breadcrumb vault={vault} />
        </Grid>
        <Grid container className={classes.descriptionSection}>
          <Description vault={vault} />
        </Grid>
      </Grid>
      {vault.state === VaultState.Discontinued && (
        <Grid item container xs>
          <VaultDeprecationWarning vault={vault} />
        </Grid>
      )}
    </Grid>
  );
};
