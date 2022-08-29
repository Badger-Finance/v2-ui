import { makeStyles } from '@material-ui/core/styles';
import VaultListTitle from 'components-v2/landing/VaultListTitle';
import { FLAGS } from 'config/environment';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { LayoutContainer } from '../components-v2/common/Containers';
import VaultListDisplay from '../components-v2/landing/VaultListDisplay';
import VaultsSearchControls from '../components-v2/VaultSearchControls';

const useStyles = makeStyles({
  root: {
    marginTop: 48,
  },
});

const Landing = observer(() => {
  const classes = useStyles();
  return (
    <LayoutContainer className={classes.root}>
      {FLAGS.APY_EVOLUTION && <VaultListTitle />}
      <VaultsSearchControls />
      <VaultListDisplay />
    </LayoutContainer>
  );
});

export default Landing;
