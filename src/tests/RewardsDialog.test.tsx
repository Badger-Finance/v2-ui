import '@testing-library/jest-dom';

import { VaultType } from '@badger-dao/sdk/lib/api/enums';
import { BigNumber } from 'ethers';
import { action } from 'mobx';
import { StoreProvider } from 'mobx/stores/store-context';
import React from 'react';

import RewardsDialog from '../components-v2/common/dialogs/RewardsDialog';
import { TokenBalance } from '../mobx/model/tokens/token-balance';
import store from '../mobx/stores/RootStore';
import UserStore from '../mobx/stores/UserStore';
import VaultStore from '../mobx/stores/VaultStore';
import { WalletStore } from '../mobx/stores/WalletStore';
import { customRender, fireEvent, screen } from './Utils';
import { SAMPLE_VAULTS } from './utils/samples';

const mockClaimProof = {
  index: '0x33d4',
  cycle: '0xe36',
  user: '0x0000000000000000000000000000000000000001',
  tokens: [
    '0x3472A5A71965499acd81997a54BBA8D852C6E53d',
    '0xfd05D3C7fe2924020620A8bE4961bBaA747e6305',
    '0x2B5455aac8d64C14786c3a29858E43b5945819C0',
  ],
  cumulativeAmounts: [
    '28019610295276968',
    '24529508667974375',
    '39890071517351528',
  ],
  proof: ['0x0000000000000000000000000000000000000001'],
  node: '0x0000000000000000000000000000000000000001',
  boost: BigNumber.from(1),
};

const mockBadgerTreeClaims: TokenBalance[] = [
  new TokenBalance(
    {
      name: 'Badger',
      symbol: 'BADGER',
      decimals: 18,
      address: '0x3472A5A71965499acd81997a54BBA8D852C6E53d',
    },
    BigNumber.from('28019610295276968'),
    0.028019610295276968,
  ),
  new TokenBalance(
    {
      name: 'bveCVX',
      symbol: 'bveCVX',
      decimals: 18,
      address: '0xfd05D3C7fe2924020620A8bE4961bBaA747e6305',
    },
    BigNumber.from('24529508667974375'),
    0.024529508667974375,
  ),
  new TokenBalance(
    {
      name: 'bCVXCRV',
      symbol: 'bCVXCRV',
      decimals: 18,
      address: '0x2B5455aac8d64C14786c3a29858E43b5945819C0',
    },
    BigNumber.from('39890071517351528'),
    0.039890071517351528,
  ),
];

describe('Rewards Dialog', () => {
  beforeEach(() => {
    jest
      .spyOn(WalletStore.prototype, 'isConnected', 'get')
      .mockReturnValue(true);
    jest
      .spyOn(WalletStore.prototype, 'address', 'get')
      .mockReturnValue('0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a');
    store.uiState.rewardsDialogOpen = true;
    store.tree.claimProof = mockClaimProof;
    store.tree.loadBadgerTree = action(jest.fn());
  });

  describe('when there are no rewards', () => {
    it('displays zero amount in rewards button', () => {
      const { container } = customRender(
        <StoreProvider value={store}>
          <RewardsDialog />
        </StoreProvider>,
      );
      expect(container).toMatchSnapshot();
    });

    it('displays no rewards dialog', () => {
      const { baseElement } = customRender(
        <StoreProvider value={store}>
          <RewardsDialog />
        </StoreProvider>,
      );
      expect(baseElement).toMatchSnapshot();
    });
  });

  describe('when there are rewards', () => {
    beforeEach(() => {
      jest.spyOn(VaultStore.prototype, 'getToken').mockReturnValue({
        name: 'Badger',
        symbol: 'BADGER',
        decimals: 18,
        address: '0x3472A5A71965499acd81997a54BBA8D852C6E53d',
      });
      store.tree.claimable = Object.fromEntries(
        mockBadgerTreeClaims.map((t) => [t.token.address, t]),
      );
    });

    it('displays rewards amount in rewards button', () => {
      const { container } = customRender(
        <StoreProvider value={store}>
          <RewardsDialog />
        </StoreProvider>,
      );
      expect(container).toMatchSnapshot();
    });

    it('displays claim options', async () => {
      const { baseElement } = customRender(
        <StoreProvider value={store}>
          <RewardsDialog />
        </StoreProvider>,
      );
      expect(baseElement).toMatchSnapshot();
    });

    it('can display user guide', () => {
      jest.spyOn(UserStore.prototype, 'getBalance').mockReturnValue(
        new TokenBalance(
          {
            address: '0x0',
            decimals: 18,
            name: 'test',
            symbol: 'Test Token',
          },
          BigNumber.from(0),
          1,
        ),
      );

      const { baseElement } = customRender(
        <StoreProvider value={store}>
          <RewardsDialog />
        </StoreProvider>,
      );
      fireEvent.click(screen.getByText('Rewards User Guide'));
      expect(baseElement).toMatchSnapshot();
    });

    it('can go back from user guide', () => {
      const { baseElement } = customRender(
        <StoreProvider value={store}>
          <RewardsDialog />
        </StoreProvider>,
      );

      fireEvent.click(screen.getByText('Rewards User Guide'));
      fireEvent.click(screen.getByRole('button', { name: 'exit guide mode' }));
      expect(baseElement).toMatchSnapshot();
    });

    describe('going to vaults from user guide', () => {
      beforeEach(() => {
        customRender(
          <StoreProvider value={store}>
            <RewardsDialog />
          </StoreProvider>,
        );
        fireEvent.click(screen.getByText('Rewards User Guide'));
      });

      it('can go to native vaults', () => {
        fireEvent.click(
          screen.getByRole('button', { name: 'view badger dao tokens' }),
        );
        expect(store.vaults.vaultsFilters.types).toEqual([VaultType.Native]);
      });

      it('can go to non-boosted vaults', () => {
        fireEvent.click(
          screen.getByRole('button', { name: 'view non-boosted tokens' }),
        );
        expect(store.vaults.vaultsFilters.types).toEqual([VaultType.Standard]);
      });

      it('can go to boosted vaults', () => {
        fireEvent.click(
          screen.getByRole('button', { name: 'view boosted tokens' }),
        );
        expect(store.vaults.vaultsFilters.types).toEqual([VaultType.Boosted]);
      });
    });

    it('executes claim geysers with correct parameters', async () => {
      throw new Error('fix me doggy');
      // const claimSpy = jest.fn().mockReturnValue(TransactionRequestResult.Success);

      // const expectedParameters = Object.fromEntries(
      // 	mockBadgerTreeClaims.map((claim) => [claim.token.address, claim]),
      // );

      // store.rewards.claimGeysers = action(claimSpy);

      // customRender(
      // 	<StoreProvider value={store}>
      // 		<RewardsDialog />
      // 	</StoreProvider>,
      // );

      // fireEvent.click(screen.getByRole('button', { name: 'Claim My Rewards' }));
      // await screen.findByText('Rewards Claimed');
      // expect(claimSpy).toHaveBeenNthCalledWith(1, expectedParameters);
    });

    it('displays invalid cycle dialog if claim geysers fails with invalid cycle error', async () => {
      throw new Error('fix me doggy');

      // jest.useFakeTimers();
      // console.error = jest.fn();
      // const reportSpy = jest.fn();

      // store.rewards.reportInvalidCycle = reportSpy;
      // store.rewards.claimGeysers = action(
      // 	jest.fn().mockImplementation(() => {
      // 		throw new Error('execution reverted: Invalid cycle');
      // 	}),
      // );

      // customRender(
      // 	<StoreProvider value={store}>
      // 		<RewardsDialog />
      // 	</StoreProvider>,
      // );

      // fireEvent.click(screen.getByRole('button', { name: 'Claim My Rewards' }));
      // jest.runOnlyPendingTimers();
      // await screen.findByText('Invalid Cycle Detected');
      // expect(reportSpy).toHaveBeenCalled();
      // jest.useRealTimers();
    });

    it('displays success dialog', async () => {
      throw new Error('fix me doggy');
      // store.rewards.claimGeysers = action(jest.fn().mockReturnValue(TransactionRequestResult.Success));

      // const { baseElement } = customRender(
      // 	<StoreProvider value={store}>
      // 		<RewardsDialog />
      // 	</StoreProvider>,
      // );

      // fireEvent.click(screen.getByRole('button', { name: 'Claim My Rewards' }));
      // await screen.findByText('Rewards Claimed');
      // expect(baseElement).toMatchSnapshot();
    });
  });
});
