import { Typography } from '@material-ui/core';
import MarkupText from 'components-v2/common/MarkupText';
import { InfluenceVaultModalConfig } from 'mobx/model/vaults/influence-vault-data';
import { observer } from 'mobx-react-lite';
import React, { useContext } from 'react';

import routes from '../../config/routes';
import { StoreContext } from '../../mobx/stores/store-context';
import { InfoDialog } from './InfoDialog';

interface Props {
  open: boolean;
  onClose: () => void;
  config: InfluenceVaultModalConfig;
}

const InfluenceVaultListModal = ({ open, onClose, config }: Props): JSX.Element => {
  const { router } = useContext(StoreContext);
  const handleLinkClick = (link: string) => {
    router.goTo(routes.vaultDetail, { vaultName: link }, { chain: router.queryParams?.chain });
  };

  return (
    <InfoDialog open={open} onClose={onClose}>
      <InfoDialog.Title onClose={onClose} title={config.title} />
      <InfoDialog.Content>
        <Typography variant="body1" color="textSecondary">
          <MarkupText text={config.body} onClick={handleLinkClick} />
        </Typography>
        <InfoDialog.Divider />
        {config.points.map((point: string[], index: number) => (
          <Typography key={index} variant="body2" color="textSecondary">
            {' '}
            <MarkupText text={point} onClick={handleLinkClick} />{' '}
          </Typography>
        ))}
      </InfoDialog.Content>
    </InfoDialog>
  );
};

export default observer(InfluenceVaultListModal);
