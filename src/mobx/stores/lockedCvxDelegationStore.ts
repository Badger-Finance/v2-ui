import { NETWORK_IDS } from 'config/constants';
import { ethers } from 'ethers';
import { extendObservable, makeAutoObservable } from 'mobx';

import { RootStore } from './RootStore';

class LockedCvxDelegationStore {
  private store: RootStore;

  public lockedCVXBalance = ethers.constants.Zero;

  constructor(store: RootStore) {
    this.store = store;

    makeAutoObservable(this);
  }

  async loadLockedCvxBalance(): Promise<void> {
    const {
      sdk: { address },
      network: { network },
    } = this.store;

    if (network.id !== NETWORK_IDS.ETH || !address) {
      return;
    }

    // try {
    // 	const cvxLocker = new web3Instance.eth.Contract(CvxLockerAbi as AbiItem[], mainnet.cvxLocker);
    // 	this.lockedCVXBalance = BigNumber.from(await cvxLocker.methods.balanceOf(address).call());
    // } catch (error) {
    // 	console.error('There was an error getting locked cvx balance: ', error);
    // 	this.lockedCVXBalance = null;
    // }
  }
}

export default LockedCvxDelegationStore;
