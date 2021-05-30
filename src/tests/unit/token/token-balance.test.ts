import BigNumber from 'bignumber.js';
import { TokenBalance } from 'mobx/model/token-balance';
import store from 'mobx/store';
import { randomValue } from 'tests/utils/random';
import { protocolTokens } from 'web3/config/token-config';

describe('token-balance', () => {
	const randomTokenBalance = (balance?: number, cost?: number): TokenBalance => {
		const availableTokens = protocolTokens();
		const options = Object.keys(availableTokens);
		const address = options[Math.floor(Math.random() * options.length)];
		const token = availableTokens[address];
		if (!token) {
			throw Error(`Require ${address} token defined`);
		}
		const amount = balance || randomValue() * Math.pow(10, token.decimals);
		const price = cost || randomValue(10, 35000);
		return new TokenBalance(store.rewards, token, new BigNumber(amount), new BigNumber(price));
	};

	const verifyScaledBalance = (mockBalance: TokenBalance, scaledBalance: TokenBalance, scalar: BigNumber): void => {
		const expectedBalance = mockBalance.balance.multipliedBy(scalar);
		const expectedTokenBalance = mockBalance.tokenBalance.multipliedBy(scalar);
		const expectedValue = mockBalance.value.multipliedBy(scalar);
		expect(scaledBalance.balance).toMatchObject(expectedBalance);
		expect(scaledBalance.tokenBalance).toMatchObject(expectedTokenBalance);
		expect(scaledBalance.value).toMatchObject(expectedValue);
	};

	// describe('contructor', () => {

	// });

	describe('fromBalance', () => {
		it('converts a visual balance string into a token balance representation', () => {
			const mockBalance = randomTokenBalance();
			const decimals = mockBalance.token.decimals;
			const amount = randomValue().toFixed(decimals);
			const balance = TokenBalance.fromBalance(mockBalance, amount);
			const expectedTokenBalance = new BigNumber(amount).multipliedBy(Math.pow(10, decimals));
			const expectedBalance = new BigNumber(amount);
			expect(balance.tokenBalance).toEqual(expectedTokenBalance);
			expect(balance.balance).toEqual(expectedBalance);
		});
	});

	describe('value', () => {
		it('returns the value of the represented token balance', () => {
			const mockBalance = randomTokenBalance();
			const expectedValue = mockBalance.balance.multipliedBy(mockBalance.price);
			expect(mockBalance.value).toMatchObject(expectedValue);
		});
	});

	describe('balanceDisplay', () => {
		describe('given a zero balance with no precision', () => {
			it('displays zero, with token decimals', () => {
				const mockBalance = randomTokenBalance(0);
				const displayString = `0.${'0'.repeat(mockBalance.token.decimals)}`;
				expect(mockBalance.balanceDisplay()).toEqual(displayString);
			});
		});

		describe('given a zero balance with precision', () => {
			it('displays zero, with precision decimals', () => {
				const mockBalance = randomTokenBalance(0);
				const decimals = 5;
				const displayString = `0.${'0'.repeat(decimals)}`;
				expect(mockBalance.balanceDisplay(decimals)).toEqual(displayString);
			});
		});

		describe('given a balance with no precision', () => {
			it('displays balance, with token decimals', () => {
				const amount = randomValue();
				const mockBalance = randomTokenBalance(amount);
				const displayString = amount.toFixed(mockBalance.token.decimals);
				expect(mockBalance.balanceDisplay()).toEqual(displayString);
			});
		});

		describe('given a balance with precision', () => {
			it('displays balance, with precision decimals', () => {
				const amount = randomValue();
				const mockBalance = randomTokenBalance(amount);
				const decimals = 5;
				const displayString = amount.toFixed(mockBalance.token.decimals);
				expect(mockBalance.balanceDisplay(decimals)).toEqual(displayString);
			});
		});

		describe('given a balance with precision below threshold', () => {
			it('displays balance as less than minimum value', () => {
				const amount = 0.000001;
				const mockBalance = randomTokenBalance(amount);
				const decimals = 5;
				const displayString = '< 0.00001';
				expect(mockBalance.balanceDisplay(decimals)).toEqual(displayString);
			});
		});
	});

	describe('scale', () => {
		describe('scalar below 1', () => {
			it('scales the balance down', () => {
				const mockBalance = randomTokenBalance(1);
				const scalar = new BigNumber(randomValue(0, 0.99));
				const scaledBalance = mockBalance.scale(scalar);
				verifyScaledBalance(mockBalance, scaledBalance, scalar);
			});
		});

		describe('scalar equals 1', () => {
			it('does not modify the balance', () => {
				const mockBalance = randomTokenBalance(1);
				const scalar = new BigNumber(1);
				const scaledBalance = mockBalance.scale(scalar);
				expect(scaledBalance).toMatchObject(mockBalance);
			});
		});

		describe('scalar above 1', () => {
			it('scales the balance up', () => {
				const mockBalance = randomTokenBalance(1);
				const scalar = new BigNumber(1.01);
				const scaledBalance = mockBalance.scale(scalar);
				verifyScaledBalance(mockBalance, scaledBalance, scalar);
			});
		});
	});

	describe('scaledBalanceDisplay', () => {
		describe('scale up', () => {
			it('scales the balance up', () => {
				const percent = randomValue(200, 500);
				const amount = randomValue(1.01, 5);
				const mockBalance = randomTokenBalance(amount);
				const displayString = ((amount * percent) / 100).toFixed(mockBalance.token.decimals);
				expect(mockBalance.scaledBalanceDisplay(percent)).toEqual(displayString);
			});
		});

		describe('scale down', () => {
			it('scales the balance up', () => {
				const percent = randomValue(20, 50);
				const amount = randomValue(1.01, 5);
				const mockBalance = randomTokenBalance(amount);
				const displayString = ((amount * percent) / 100).toFixed(mockBalance.token.decimals);
				expect(mockBalance.scaledBalanceDisplay(percent)).toEqual(displayString);
			});
		});
	});
});
