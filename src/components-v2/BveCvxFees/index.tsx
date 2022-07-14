import { VaultDTO } from '@badger-dao/sdk';
import { Grid, makeStyles, Typography } from '@material-ui/core';
import influenceFees from 'config/bve-cvx/vote-influence-fees.json';
import React, { useState } from 'react';

import { StrategyFee } from '../../mobx/model/system-config/stategy-fees';
import { getVaultStrategyFee } from '../../mobx/utils/fees';
import { formatStrategyFee } from '../../utils/componentHelpers';
import BveCvxInfluenceFeesInfo from '../BveCvxInfluenceFeesInfo';
import SpecItem from '../vault-detail/specs/SpecItem';
import { StyledDivider, StyledHelpIcon } from '../vault-detail/styled';

const useStyles = makeStyles((theme) => ({
  title: {
    paddingBottom: theme.spacing(0.15),
    fontSize: '1.25rem',
  },
  spec: {
    fontSize: 12,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing(0.5),
  },
  subSpec: {
    paddingLeft: 15,
    marginBottom: theme.spacing(0.5),
  },
}));

interface Props {
  vault: VaultDTO;
}

const BveCvxFees = ({ vault }: Props): JSX.Element => {
  const classes = useStyles();
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const withdrawFee = getVaultStrategyFee(vault, StrategyFee.withdraw);

  return (
    <Grid container>
      <Typography variant="h6" className={classes.title}>
        Fees
      </Typography>
      <StyledDivider />
      <Grid container direction="column">
        <Grid item container>
          <Typography display="inline" color="textSecondary" className={classes.spec}>
            Vote Influence Fees
            <StyledHelpIcon onClick={() => setInfoDialogOpen(true)} />
          </Typography>
          <Grid container direction="column">
            {Object.entries(influenceFees).map(([key, value]) => (
              <SpecItem key={key} className={classes.subSpec} name={key} value={value} />
            ))}
          </Grid>
        </Grid>
        <Grid item container justifyContent="space-between">
          <SpecItem name="Withdrawal Fee" value={formatStrategyFee(withdrawFee)} />
        </Grid>
      </Grid>
      <BveCvxInfluenceFeesInfo open={infoDialogOpen} onClose={() => setInfoDialogOpen(false)} />
    </Grid>
  );
};

export default BveCvxFees;
