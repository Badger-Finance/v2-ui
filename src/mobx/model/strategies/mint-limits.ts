import BigNumber from 'bignumber.js';

export interface MintLimits {
  userLimit: BigNumber;
  allUsersLimit: BigNumber;
  individualLimit: BigNumber;
  globalLimit: BigNumber;
}
