import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React, { useContext } from 'react';

import {
  APP_NEWS_MESSAGE,
  APP_NEWS_URL,
  APP_NEWS_URL_TEXT,
} from '../../config/constants';
import Banner from '../../ui-library/Banner';
import BannerCloseIconButton from '../../ui-library/BannerCloseIconButton';

const Announcements = (): JSX.Element | null => {
  const { uiState } = useContext(StoreContext);

  if (!uiState.shouldShowNotification || !APP_NEWS_MESSAGE) {
    return null;
  }

  return (
    <Banner
      message={APP_NEWS_MESSAGE}
      link={APP_NEWS_URL}
      linkText={APP_NEWS_URL_TEXT}
      closeElement={
        <BannerCloseIconButton onClose={() => uiState.closeNotification()} />
      }
    />
  );
};

export default observer(Announcements);
