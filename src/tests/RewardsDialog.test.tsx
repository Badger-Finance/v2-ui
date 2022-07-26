import '@testing-library/jest-dom';

import { RewardsService, TransactionStatus } from '@badger-dao/sdk';
import { VaultType } from '@badger-dao/sdk/lib/api/enums';
import { BigNumber } from 'ethers';
import { action } from 'mobx';
import { StoreProvider } from 'mobx/stores/store-context';
import React from 'react';

import RewardsDialog from '../components-v2/common/dialogs/RewardsDialog';
import { TokenBalance } from '../mobx/model/tokens/token-balance';
import store from '../mobx/stores/RootStore';
import { customRender, fireEvent, screen } from './Utils';

function arrayEquals(a: unknown[], b: unknown[]): boolean {
  return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((val, index) => val === b[index]);
}

const mockClaimProof = {
  index: '0x33d4',
  cycle: '0xe36',
  user: '0x0000000000000000000000000000000000000001',
  tokens: [
    '0x3472A5A71965499acd81997a54BBA8D852C6E53d',
    '0xfd05D3C7fe2924020620A8bE4961bBaA747e6305',
    '0x2B5455aac8d64C14786c3a29858E43b5945819C0',
  ],
  cumulativeAmounts: ['28019610295276968', '24529508667974375', '39890071517351528'],
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
    BigNumber.from('2801961'),
    0.02801961,
  ),
  new TokenBalance(
    {
      name: 'bveCVX',
      symbol: 'bveCVX',
      decimals: 18,
      address: '0xfd05D3C7fe2924020620A8bE4961bBaA747e6305',
    },
    BigNumber.from('245295'),
    0.0245295,
  ),
  new TokenBalance(
    {
      name: 'bCVXCRV',
      symbol: 'bCVXCRV',
      decimals: 18,
      address: '0x2B5455aac8d64C14786c3a29858E43b5945819C0',
    },
    BigNumber.from('3989007'),
    0.03989007,
  ),
];

describe('Rewards Dialog', () => {
  beforeEach(() => {
    store.wallet.address = '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a';
    store.uiState.rewardsDialogOpen = true;
    store.tree.claimProof = mockClaimProof;
    store.tree.loadBadgerTree = action(jest.fn());
  });

  describe('when there are no rewards', () => {
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
      store.tree.claimable = Object.fromEntries(mockBadgerTreeClaims.map((t) => [t.token.address, t]));
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
        fireEvent.click(screen.getByRole('button', { name: 'view badger dao tokens' }));
        expect(store.vaults.vaultsFilters.types).toEqual([VaultType.Native]);
      });

      it('can go to non-boosted vaults', () => {
        fireEvent.click(screen.getByRole('button', { name: 'view non-boosted tokens' }));
        expect(store.vaults.vaultsFilters.types).toEqual([VaultType.Standard]);
      });

      it('can go to boosted vaults', () => {
        fireEvent.click(screen.getByRole('button', { name: 'view boosted tokens' }));
        expect(store.vaults.vaultsFilters.types).toEqual([VaultType.Boosted]);
      });
    });

    it('executes claim geysers with correct parameters', async () => {
      const claimSpy = jest
        .spyOn(RewardsService.prototype, 'claim')
        .mockReturnValue(Promise.resolve(TransactionStatus.Success));

      customRender(
        <StoreProvider value={store}>
          <RewardsDialog />
        </StoreProvider>,
      );

      const claimOptions = Object.fromEntries(
        Object.entries(store.tree.claimable).map((e) => {
          const options = {
            hasBalance: e[1].tokenBalance.gt(0),
            balance: TokenBalance.fromBigNumber(e[1], e[1].tokenBalance),
          };
          return [e[0], options];
        }),
      );

      const claimAmounts = Object.values(claimOptions).map((c) => c.balance.tokenBalance);

      expect.extend({
        toHaveCorrectNonFunctionParams(received, expected) {
          const pass =
            arrayEquals(received.tokens, expected.tokens) &&
            arrayEquals(received.cumulativeAmounts, expected.cumulativeAmounts) &&
            received.index === expected.index &&
            arrayEquals(received.proof, expected.proof) &&
            received.cycle === expected.cycle &&
            arrayEquals(received.claimAmounts, expected.claimAmounts);

          if (pass) {
            return {
              message: () => `expected ${received} to have correct non-function params`,
              pass: true,
            };
          } else {
            return {
              message: () => `expected ${received} to have correct non-function params`,
              pass: false,
            };
          }
        },
      });

      fireEvent.click(screen.getByRole('button', { name: 'Claim My Rewards' }));

      expect(claimSpy.mock.calls[0][0]).toHaveCorrectNonFunctionParams({
        claimAmounts,
        ...mockClaimProof,
      });
    });

    it('displays invalid cycle dialog if claim geysers fails with invalid cycle error', async () => {
      console.error = jest.fn();
      const reportSpy = jest.fn();
      store.tree.reportInvalidCycle = reportSpy;

      jest.spyOn(RewardsService.prototype, 'claim').mockImplementation(async (params) => {
        if (params.onError) params.onError(new Error('execution reverted: Invalid cycle'));
        return TransactionStatus.Failure;
      });

      customRender(
        <StoreProvider value={store}>
          <RewardsDialog />
        </StoreProvider>,
      );

      fireEvent.click(screen.getByRole('button', { name: 'Claim My Rewards' }));
      await screen.findByText('Invalid Cycle Detected');
      expect(reportSpy).toHaveBeenCalled();
    });

    it('displays success dialog', async () => {
      jest.spyOn(RewardsService.prototype, 'claim').mockImplementation(async (params) => {
        if (params.onSuccess) params.onSuccess({});
        return TransactionStatus.Success;
      });

      const { baseElement } = customRender(
        <StoreProvider value={store}>
          <RewardsDialog />
        </StoreProvider>,
      );

      fireEvent.click(screen.getByRole('button', { name: 'Claim My Rewards' }));
      await screen.findByText('Rewards Claimed');
      expect(baseElement).toMatchSnapshot();
    });
  });
});
