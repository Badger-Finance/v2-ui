import '@testing-library/jest-dom';

import { StoreProvider } from 'mobx/stores/store-context';

import WalletWidget from '../components-v2/common/WalletWidget';
import store from '../mobx/stores/RootStore';
import { WalletStore } from '../mobx/stores/WalletStore';
import { cleanup, customRender, fireEvent, screen } from './Utils';
import { checkSnapshot } from './utils/snapshots';

/* eslint-disable */

jest.unmock('web3modal');

describe('WalletWidget', () => {
  afterEach(cleanup);

  const testStore = store;

  test('Renders correctly', () => {
    checkSnapshot(<WalletWidget />);
  });

  test('Renders mobile version correctly', () => {
    function createMatchMedia() {
      return (): MediaQueryList => ({
        media: '480px',
        matches: true,
        addEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        removeEventListener: () => {},
        onchange: () => {},
        dispatchEvent: () => true,
      });
    }

    window.matchMedia = createMatchMedia();

    checkSnapshot(<WalletWidget />);
  });

  test('Displays walletSelect menu upon click', async () => {
    customRender(
      <StoreProvider value={testStore}>
        <WalletWidget />
      </StoreProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: /connect/i }));
    expect(screen.getByText('WalletConnect')).toBeInTheDocument();
  });

  test('Connected address is properly displayed', async () => {
    jest.spyOn(WalletStore.prototype, 'isConnected', 'get').mockReturnValue(true);
    store.wallet.address = '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a';
    const { container } = customRender(
      <StoreProvider value={testStore}>
        <WalletWidget />
      </StoreProvider>,
    );
    expect(container).toMatchSnapshot();
  });
});
