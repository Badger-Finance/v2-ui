import { RootStore } from '../RootStore';
import mainnet from '../../config/deployments/mainnet.json';
import Web3 from 'web3';
import CvxDelegatorAbi from '../../config/system/abis/CvxDelegator.json';
import CvxLockerAbi from '../../config/system/abis/CvxLocker.json';
import { AbiItem } from 'web3-utils';
import { sendContractMethod } from '../utils/web3';
import { DelegationState } from '../model/setts/locked-cvx-delegation';
import { extendObservable, observe } from 'mobx';
import BigNumber from 'bignumber.js';
import { ZERO_ADDR } from 'config/constants';

const ID_TO_DELEGATE = '0x6376782e657468'; // cvx.eth in hex
const BADGER_DELEGATE_ADDRESS = '0x14F83fF95D4Ec5E8812DDf42DA1232b0ba1015e6';

class LockedCvxDelegationStore {
	private store: RootStore;
	delegationState?: DelegationState;

	constructor(store: RootStore) {
		this.store = store;

		extendObservable(this, {
			delegationState: this.delegationState,
		});

		observe(this.store.user, 'settBalances', () => {
			const areSettBalancesAvailable = Object.keys(this.store.user.settBalances).length > 0;

			if (areSettBalancesAvailable) {
				this.getUserDelegationState();
			}
		});
	}

	async getUserDelegationState(): Promise<void> {
		const {
			wallet: { provider, connectedAddress },
		} = this.store;

		const web3 = new Web3(provider);
		const cvxLocker = new web3.eth.Contract(CvxLockerAbi as AbiItem[], mainnet.cvxLocker);
		const lockedCVXBalance = new BigNumber(await cvxLocker.methods.balanceOf(connectedAddress).call());

		if (!lockedCVXBalance.gt(0)) {
			this.delegationState = DelegationState.Ineligible;
			return;
		}

		const cvxDelegator = new web3.eth.Contract(CvxDelegatorAbi as AbiItem[], mainnet.cvxDelegator);
		const alreadyDelegatedAddress = await cvxDelegator.methods.delegation(connectedAddress, ID_TO_DELEGATE).call();

		if (alreadyDelegatedAddress && alreadyDelegatedAddress !== ZERO_ADDR) {
			const isBadgerDelegatedAddress = alreadyDelegatedAddress === BADGER_DELEGATE_ADDRESS;

			this.delegationState = isBadgerDelegatedAddress
				? DelegationState.BadgerDelegated
				: DelegationState.Delegated;

			return;
		}

		this.delegationState = DelegationState.Eligible;
	}

	async delegateLockedCVX(): Promise<void> {
		const {
			uiState: { queueNotification },
			wallet: { provider },
		} = this.store;

		const web3 = new Web3(provider);
		const cvxDelegator = new web3.eth.Contract(CvxDelegatorAbi as AbiItem[], mainnet.cvxDelegator);

		const setDelegate = cvxDelegator.methods.setDelegate(ID_TO_DELEGATE, BADGER_DELEGATE_ADDRESS);
		const options = await this.store.wallet.getMethodSendOptions(setDelegate);

		queueNotification(`Sign the transaction to delegate your locked CVX`, 'info');

		await sendContractMethod(
			this.store,
			setDelegate,
			options,
			'Delegation transaction submitted',
			'Thanks for delegating your locked CVX to Badger!',
		);
	}
}

export default LockedCvxDelegationStore;
