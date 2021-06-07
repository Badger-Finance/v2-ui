import BigNumber from 'bignumber.js';
import { TokenBalance } from 'mobx/model/token-balance';
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
		const scalar = Math.pow(10, token.decimals);
		const amount = balance !== undefined ? balance : randomValue();
		const price = cost !== undefined ? cost : randomValue(10, 35000);
		return new TokenBalance(token, new BigNumber(amount * scalar), new BigNumber(price));
	};

	const verifyScaledBalance = (mockBalance: TokenBalance, scaledBalance: TokenBalance, scalar: BigNumber): void => {
		const expectedBalance = mockBalance.balance.multipliedBy(scalar);
		const expectedTokenBalance = mockBalance.tokenBalance.multipliedBy(scalar);
		const expectedValue = mockBalance.value.multipliedBy(scalar);
		expect(scaledBalance.balance).toEqual(expectedBalance);
		expect(scaledBalance.tokenBalance).toEqual(expectedTokenBalance);
		expect(scaledBalance.value).toEqual(expectedValue);
	};

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
				const amount = 3.655;
				const mockBalance = randomTokenBalance(amount);
				const displayString = new BigNumber(amount).toFixed(mockBalance.token.decimals);
				expect(mockBalance.balanceDisplay()).toEqual(displayString);
			});
		});

		describe('given a balance with precision', () => {
			it('displays balance, with precision decimals', () => {
				const amount = 3.655;
				const mockBalance = randomTokenBalance(amount);
				const decimals = 5;
				const displayString = new BigNumber(amount).toFixed(decimals);
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
		describe('scalar does not equal 1', () => {
			it('scales the balance in the appropriate scalar amount', () => {
				const mockBalance = randomTokenBalance(1);
				const scalar = new BigNumber(randomValue(0, 2));
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
	});

	describe('scaledBalanceDisplay', () => {
		describe('scale up', () => {
			it('scales the balance up', () => {
				const percent = randomValue(250, 500);
				const amount = randomValue(1.01, 5);
				const mockBalance = randomTokenBalance(amount);
				const expectedTokenBalance = mockBalance.balance.multipliedBy(new BigNumber(percent / 100));
				const displayString = expectedTokenBalance.toFixed(mockBalance.token.decimals);
				expect(mockBalance.scaledBalanceDisplay(percent)).toEqual(displayString);
			});
		});

		describe('scale down', () => {
			it('scales the balance up', () => {
				const percent = randomValue(35, 50);
				const amount = randomValue(1.01, 5);
				const mockBalance = randomTokenBalance(amount);
				const expectedTokenBalance = mockBalance.balance.multipliedBy(new BigNumber(percent / 100));
				const displayString = expectedTokenBalance.toFixed(mockBalance.token.decimals);
				expect(mockBalance.scaledBalanceDisplay(percent)).toEqual(displayString);
			});
		});
	});
});
