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
import { NETWORK_IDS, ZERO_ADDR } from 'config/constants';
import VotiumMerkleTreeAbi from '../../config/system/abis/VotiumMerkleTree.json';
import { VotiumMerkleTree, VotiumTreeEntry } from '../model/rewards/votium-merkle-tree';

const ID_TO_DELEGATE = '0x6376782e657468'; // cvx.eth in hex
const BADGER_DELEGATE_ADDRESS = '0x14F83fF95D4Ec5E8812DDf42DA1232b0ba1015e6';

class LockedCvxDelegationStore {
	private store: RootStore;
	delegationState?: DelegationState;
	totalEarned?: BigNumber | null;
	unclaimedBalance?: BigNumber | null;
	lockedCVXBalance?: BigNumber | null;

	constructor(store: RootStore) {
		this.store = store;

		extendObservable(this, {
			lockedCVXBalance: this.lockedCVXBalance,
			totalEarned: this.totalEarned,
			unclaimedBalance: this.unclaimedBalance,
			delegationState: this.delegationState,
		});

		observe(this.store.user, 'accountDetails', () => {
			this.loadLockedCvxBalance();
			this.loadVotiumRewardsInformation();
		});

		observe(this.store.user, 'settBalances', () => {
			const areSettBalancesAvailable = Object.keys(this.store.user.settBalances).length > 0;

			if (areSettBalancesAvailable) {
				this.getUserDelegationState();
			}
		});
	}

	async loadLockedCvxBalance(): Promise<void> {
		const {
			network: { network },
			wallet: { provider, connectedAddress },
		} = this.store;

		if (network.id !== NETWORK_IDS.ETH) {
			return;
		}

		try {
			const web3 = new Web3(provider);
			const cvxLocker = new web3.eth.Contract(CvxLockerAbi as AbiItem[], mainnet.cvxLocker);
			this.lockedCVXBalance = new BigNumber(await cvxLocker.methods.balanceOf(connectedAddress).call());
		} catch (error) {
			console.error('There was an error getting locked cvx balance: ', error);
			this.lockedCVXBalance = null;
		}
	}

	/**
	 * gets votium merkle tree from the votium Github repositories
	 */
	async getVotiumMerkleTree(): Promise<VotiumMerkleTree> {
		const votiumRepoContentRequest = await fetch(
			'https://api.github.com/repos/oo-00/Votium/git/trees/main?recursive=1',
		);

		const votiumRepoContent = await votiumRepoContentRequest.json();

		const badgerMerkleTreeFiles: VotiumTreeEntry[] = votiumRepoContent.tree.filter((content: VotiumTreeEntry) =>
			content.path.includes('merkle/BADGER/'),
		);

		const latestMerkleTree = badgerMerkleTreeFiles[badgerMerkleTreeFiles.length - 1];

		const merkleTreeContentRequest = await fetch(
			`https://raw.githubusercontent.com/oo-00/Votium/main/${latestMerkleTree.path}`,
		);

		return await merkleTreeContentRequest.json();
	}

	async loadVotiumRewardsInformation(): Promise<void> {
		try {
			const [totalEarned, unclaimedBalance] = await Promise.all([
				this.getTotalVotiumRewards(),
				this.getUnclaimedVotiumRewards(),
			]);

			this.totalEarned = totalEarned;
			this.unclaimedBalance = unclaimedBalance;
		} catch (error) {
			console.error('There was an error fetching Votium merkle tree information: ', error);
			this.totalEarned = null;
			this.unclaimedBalance = null;
		}
	}

	async getTotalVotiumRewards(): Promise<BigNumber> {
		const {
			wallet: { connectedAddress, provider },
		} = this.store;

		let totalEarned = new BigNumber(0);

		const web3 = new Web3(provider);
		const votiumMerkleTreeContract = new web3.eth.Contract(
			VotiumMerkleTreeAbi as AbiItem[],
			mainnet.votium.merkleTree,
		);

		const claimedEvents = await votiumMerkleTreeContract.getPastEvents('Claimed', {
			fromBlock: 'earliest',
			filter: { token: mainnet.tokens.badger, account: connectedAddress },
		});

		for (const claimedEvent of claimedEvents) {
			totalEarned = totalEarned.plus(claimedEvent.returnValues['amount']);
		}

		return totalEarned;
	}

	async getUnclaimedVotiumRewards(): Promise<BigNumber> {
		const {
			wallet: { connectedAddress, provider },
		} = this.store;

		let unclaimedBalance = new BigNumber(0);

		const merkleTree = await this.getVotiumMerkleTree();
		const merkleTreeReward = merkleTree.claims[Web3.utils.toChecksumAddress(connectedAddress)];

		if (!merkleTreeReward) {
			return unclaimedBalance;
		}

		const web3 = new Web3(provider);

		const votiumMerkleTreeContract = new web3.eth.Contract(
			VotiumMerkleTreeAbi as AbiItem[],
			mainnet.votium.merkleTree,
		);

		const isClaimed = await votiumMerkleTreeContract.methods
			.isClaimed(mainnet.tokens.badger, merkleTreeReward.index)
			.call();

		if (!isClaimed) {
			unclaimedBalance = new BigNumber(merkleTreeReward.amount);
		}

		return unclaimedBalance;
	}

	async getUserDelegationState(): Promise<void> {
		const {
			network: { network },
			wallet: { provider, connectedAddress },
		} = this.store;

		if (network.id !== NETWORK_IDS.ETH || !this.lockedCVXBalance) {
			return;
		}

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

	async claimVotiumRewards(): Promise<void> {
		const {
			uiState: { queueNotification },
			wallet: { provider, connectedAddress },
		} = this.store;

		const merkleTree = await this.getVotiumMerkleTree();
		const merkleTreeClaim = merkleTree.claims[Web3.utils.toChecksumAddress(connectedAddress)];

		if (!merkleTreeClaim) {
			console.error('Votium merkle tree not available');
			return;
		}

		const web3 = new Web3(provider);
		const votiumMerkleTree = new web3.eth.Contract(VotiumMerkleTreeAbi as AbiItem[], mainnet.votium.merkleTree);

		const isClaimed: boolean = await votiumMerkleTree.methods
			.isClaimed(mainnet.tokens.badger, merkleTreeClaim.index)
			.call();

		if (isClaimed) {
			console.error('Rewards are already claimed');
			return;
		}

		const { index, amount, proof } = merkleTreeClaim;

		const claimRewards = votiumMerkleTree.methods.claim(
			mainnet.tokens.badger,
			index,
			connectedAddress,
			amount,
			proof,
		);

		const options = await this.store.wallet.getMethodSendOptions(claimRewards);

		queueNotification(`Sign the transaction to claim your rewards`, 'info');

		await sendContractMethod(
			this.store,
			claimRewards,
			options,
			'Claim transaction submitted',
			'Your rewards have been claimed successfully!',
		);
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
