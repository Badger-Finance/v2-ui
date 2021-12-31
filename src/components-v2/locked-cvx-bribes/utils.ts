import BigNumber from 'bignumber.js';
import { formatWithoutExtraZeros, numberWithCommas, unscale } from '../../mobx/utils/helpers';

export function formatBalance(balance: BigNumber): string {
  return numberWithCommas(formatWithoutExtraZeros(unscale(balance, 18)));
}
