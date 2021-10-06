import { RootStore } from '../RootStore';
import mainnet from '../../config/deployments/mainnet.json';
import Web3 from 'web3';
import CvxDelegatorAbi from '../../config/system/abis/CvxDelegator.json';
import { AbiItem } from 'web3-utils';
import { sendContractMethod } from '../utils/web3';

class LockedCvxDelegationStore {
	private store: RootStore;

	constructor(store: RootStore) {
		this.store = store;
	}

	async delegateLockedCVX(): Promise<void> {
		const {
			uiState: { queueNotification },
			wallet: { provider, connectedAddress },
			user,
		} = this.store;

		const lockedCVXBalance = user.getTokenBalance(mainnet.sett_system.vaults['native.icvx']);

		if (!lockedCVXBalance.balance.gt(0)) {
			console.error('locked balance is zero');
			return;
		}

		const web3 = new Web3(provider);
		const cvxDelegator = new web3.eth.Contract(CvxDelegatorAbi as AbiItem[], mainnet.cvxDelegator);

		const ID_TO_DELEGATE = '0x6376782e657468'; // cvx.eth in hex
		const BADGER_DELEGATE_ADDRESS = '0x14F83fF95D4Ec5E8812DDf42DA1232b0ba1015e6';

		const alreadyDelegatedAddress = await cvxDelegator.methods.delegation(connectedAddress, ID_TO_DELEGATE).call();

		if (alreadyDelegatedAddress) {
			if (alreadyDelegatedAddress === BADGER_DELEGATE_ADDRESS) {
				queueNotification(
					"You already delegated your locked CVX to Badger. Thanks, you're a top badger!",
					'info',
				);
				return;
			}

			const wouldLikeToOverride = window.confirm(
				'You already delegated your locked CVX, would you like to re-delegate to Badger?',
			);

			if (!wouldLikeToOverride) {
				return;
			}
		}

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
