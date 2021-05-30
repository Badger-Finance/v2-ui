import BigNumber from 'bignumber.js';
import { TokenBalance } from 'mobx/model/token-balance';
import store from 'mobx/store';
import { randomValue } from 'tests/utils/random';
import { ETH_DEPLOY } from 'web3/config/eth-config';
import { getToken } from 'web3/config/token-config';

describe('token-balance', () => {
	// describe('contructor', () => {});

	describe('fromBalance', () => {
		it('converts a visual balance string into a token balance representation', () => {
			const badger = getToken(ETH_DEPLOY.tokens.badger);
      if (!badger) {
        throw Error('Require badger token defined');
      }
			const amount = randomValue().toFixed(badger.decimals);
			const mockBalance = store.rewards.mockBalance(badger.address);
			const balance = TokenBalance.fromBalance(mockBalance, amount);
			const expectedTokenBalance = new BigNumber(amount).multipliedBy(Math.pow(10, badger.decimals));
			const expectedBalance = new BigNumber(amount);
			expect(balance.tokenBalance).toEqual(expectedTokenBalance);
			expect(balance.balance).toEqual(expectedBalance);
		});
	});
});
