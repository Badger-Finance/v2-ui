import { Grid, makeStyles, Typography } from '@material-ui/core';
import MarkupText from 'components-v2/common/MarkupText';
import { InfluenceVaultFeeModalConfig } from 'mobx/model/vaults/influence-vault-data';
import React, { useContext } from 'react';

import routes from '../../config/routes';
import { StoreContext } from '../../mobx/stores/store-context';
import { InfoDialog } from './InfoDialog';

const useStyles = makeStyles(() => ({
  feeSpec: {
    marginBottom: 25,
  },
  specTitle: {
    fontWeight: 700,
  },
}));

interface Props {
  open: boolean;
  onClose: () => void;
  config: InfluenceVaultFeeModalConfig;
}

const InfluenceVaultModal = ({ open, onClose, config }: Props): JSX.Element => {
  const classes = useStyles();
  const { router } = useContext(StoreContext);
  const handleLinkClick = (link: string) => {
    router.goTo(routes.vaultDetail, { vaultName: link }, { chain: router.queryParams?.chain });
  };

  return (
    <InfoDialog open={open} onClose={onClose}>
      <InfoDialog.Title onClose={onClose} title="Vote Influence Fees" />
      <InfoDialog.Content>
        <Typography variant="body1" color="textSecondary">
          {config.title}
        </Typography>
        <InfoDialog.Divider />
        <Grid container direction="column">
          {config.points.map((point, index) => (
            <Grid item key={index} className={classes.feeSpec}>
              <Typography className={classes.specTitle} variant="body2" color="textSecondary">
                <MarkupText text={point.title} onClick={handleLinkClick} />
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <MarkupText text={point.body} onClick={handleLinkClick} />
              </Typography>
            </Grid>
          ))}
        </Grid>
      </InfoDialog.Content>
    </InfoDialog>
  );
};

export default InfluenceVaultModal;
