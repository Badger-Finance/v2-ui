import { RootStore } from '../RootStore';
import mainnet from '../../config/deployments/mainnet.json';
import Web3 from 'web3';
import CvxDelegatorAbi from '../../config/system/abis/CvxDelegator.json';
import { AbiItem } from 'web3-utils';
import { sendContractMethod } from '../utils/web3';
import { NETWORK_IDS } from '../../config/constants';

class CvxDelegationStore {
	private store: RootStore;

	constructor(store: RootStore) {
		this.store = store;
	}

	get canUserDelegateLockedCVX(): boolean {
		const {
			network: { network },
			user,
			setts,
		} = this.store;

		if (network.id !== NETWORK_IDS.ETH || !setts.initialized) {
			return false;
		}

		const cvxSett = setts.getSett(mainnet.sett_system.vaults['native.cvx']);

		if (!cvxSett) {
			console.error('cvx sett information not available');
			return false;
		}

		return user.getSettBalance(cvxSett).balance > 0;
	}

	async delegateLockedCVX(): Promise<void> {
		const {
			uiState: { queueNotification },
			wallet: { provider },
		} = this.store;

		if (!this.canUserDelegateLockedCVX) {
			return;
		}

		const web3 = new Web3(provider);
		const cvxDelegator = new web3.eth.Contract(CvxDelegatorAbi as AbiItem[], mainnet.cvxDelegator);

		const ID_TO_DELEGATE = '0x6376782e657468'; // cvx.eth in hex
		const ADDRESS_TO_DELEGATE = '0x14F83fF95D4Ec5E8812DDf42DA1232b0ba1015e6';

		const setDelegate = cvxDelegator.methods.setDelegate(ID_TO_DELEGATE, ADDRESS_TO_DELEGATE);
		const options = await this.store.wallet.getMethodSendOptions(setDelegate);

		queueNotification(`Sign the transaction to delegate your CVX`, 'info');

		await sendContractMethod(
			this.store,
			setDelegate,
			options,
			'Delegation transaction submitted',
			'Successfully delegated CVX',
		);
	}
}

export default CvxDelegationStore;
