import { formatBalance, Token } from '@badger-dao/sdk';
import availableTokens from '@badger-dao/sdk-mocks/generated/ethereum/api/loadTokens.json';
import { parseUnits } from 'ethers/lib/utils';
import { TokenBalance } from 'mobx/model/tokens/token-balance';
import { randomValue } from 'tests/utils/random';

describe('token-balance', () => {
  const testTokens: Record<string, Token> = availableTokens;

  const randomTokenBalance = (balance?: number, cost?: number): TokenBalance => {
    const options = Object.keys(availableTokens);
    const address = options[Math.floor(Math.random() * options.length)];
    const token = testTokens[address];
    if (!token) {
      throw Error(`Require ${address} token defined`);
    }
    const amount = balance !== undefined ? balance : randomValue();
    const price = cost !== undefined ? cost : randomValue(10, 35000);
    return new TokenBalance(token, parseUnits(amount.toString(), token.decimals), price);
  };

  describe('fromBalance', () => {
    it('converts a visual balance string into a token balance representation', () => {
      const mockBalance = randomTokenBalance();
      const decimals = mockBalance.token.decimals;
      const amount = randomValue();
      const balance = TokenBalance.fromBalance(mockBalance, amount);
      const expectedTokenBalance = parseUnits(String(amount), decimals);
      const expectedBalance = formatBalance(expectedTokenBalance, decimals);
      expect(balance.tokenBalance).toEqual(expectedTokenBalance);
      expect(balance.balance).toEqual(expectedBalance);
    });
  });

  describe('value', () => {
    it('returns the value of the represented token balance', () => {
      const mockBalance = randomTokenBalance();
      const expectedValue = mockBalance.balance * mockBalance.price;
      expect(mockBalance.value).toEqual(expectedValue);
    });
  });

  describe('balanceDisplay', () => {
    describe('given a zero balance with no precision', () => {
      it('displays zero, with token decimals', () => {
        const mockBalance = randomTokenBalance(0);
        expect(mockBalance.balanceDisplay()).toEqual('0.0');
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
        expect(mockBalance.balanceDisplay()).toEqual(amount.toString());
      });
    });

    describe('given a balance with precision', () => {
      it('displays balance, with precision decimals', () => {
        const amount = 3.655;
        const mockBalance = randomTokenBalance(amount);
        const decimals = 5;
        const displayString = amount.toFixed(decimals);
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

  // TODO: the scaling functions have some differences in the last few decimals from the
  // expected values. E.G: Expected: "1.270783650000000042", Received: "1.270783650000000204"

  describe('scale', () => {
    // describe('scalar does not equal 1', () => {
    //   it('scales the balance in the appropriate scalar amount', () => {
    //     const mockBalance = randomTokenBalance(1);
    //     const scalar = randomValue(0, 2);
    //     const scaledBalance = mockBalance.scale(scalar);
    //     verifyScaledBalance(mockBalance, scaledBalance, scalar);
    //   });
    // });

    describe('scalar equals 1', () => {
      it('does not modify the balance', () => {
        const mockBalance = randomTokenBalance(1);
        const scaledBalance = mockBalance.scale(1);
        expect(scaledBalance).toEqual(mockBalance);
      });
    });
  });

  // describe('scaledBalanceDisplay', () => {
  //   describe('scale up', () => {
  //     it('scales the balance up', () => {
  //       const percent = randomValue(250, 500);
  //       const amount = randomValue(1.01, 5);
  //       const mockBalance = randomTokenBalance(amount);
  //       const expectedTokenBalance = (mockBalance.balance * percent) / 100;
  //       const displayString = expectedTokenBalance.toFixed(mockBalance.token.decimals);
  //       expect(mockBalance.scaledBalanceDisplay(percent)).toEqual(displayString);
  //     });
  //   });
  //
  //   describe('scale down', () => {
  //     it('scales the balance up', () => {
  //       const percent = randomValue(35, 50);
  //       const amount = randomValue(1.01, 5);
  //       const mockBalance = randomTokenBalance(amount);
  //       const expectedTokenBalance = (mockBalance.balance * percent) / 100;
  //       const displayString = expectedTokenBalance.toFixed(mockBalance.token.decimals);
  //       expect(mockBalance.scaledBalanceDisplay(percent)).toEqual(displayString);
  //     });
  //   });
  // });

  describe('balanceValueDisplay', () => {
    describe('given no price is available', () => {
      it('displays token balance', () => {
        const mockBalance = new TokenBalance(
          {
            address: '',
            name: 'Badger',
            symbol: 'Badger',
            decimals: 18,
          },
          parseUnits('10000', 18),
          0,
        );
        const displayString = `10000.${'0'.repeat(8)} Badger`;
        expect(mockBalance.balanceValueDisplay()).toEqual(displayString);
      });
    });
  });
});
