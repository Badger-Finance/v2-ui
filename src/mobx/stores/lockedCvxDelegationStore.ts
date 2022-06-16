import BigNumber from 'bignumber.js';
import { NETWORK_IDS } from 'config/constants';
import { ethers } from 'ethers';
import { extendObservable, observe } from 'mobx';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

import mainnet from '../../config/deployments/mainnet.json';
import { FLAGS } from '../../config/environment';
import CvxDelegatorAbi from '../../config/system/abis/CvxDelegator.json';
import CvxLockerAbi from '../../config/system/abis/CvxLocker.json';
import VotiumMerkleTreeAbi from '../../config/system/abis/VotiumMerkleTree.json';
import { fetchData } from '../../utils/fetchData';
import { VotiumGithubTreeInformation, VotiumMerkleTree, VotiumTreeEntry } from '../model/rewards/votium-merkle-tree';
import { DelegationState } from '../model/vaults/locked-cvx-delegation';
import { RootStore } from '../RootStore';
import { sendContractMethod } from '../utils/web3';

// this is mainnet only
const votiumRewardsContractAddress = '0x378Ba9B73309bE80BF4C2c027aAD799766a7ED5A';

// this is Votium's Github repository URL, we use it to fetch their latest version of their rewards merkle tree.
const votiumMerkleTreeUrl = 'https://api.github.com/repos/oo-00/Votium/git/trees/main?recursive=1';

// we use the raw content API from Github to get the content of the merkle tree
const rawVotiumMerkleTreeUrl = 'https://raw.githubusercontent.com/oo-00/Votium/main';

const ID_TO_DELEGATE = '0x6376782e657468'; // cvx.eth in hex

// this is Badger's address that we ask users to delegate to
const BADGER_DELEGATE_ENS = 'delegate.badgerdao.eth';

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

		if (FLAGS.LOCKED_CVX_DELEGATION_WIDGET) {
			observe(this.store.user, 'accountDetails', () => {
				this.loadLockedCvxBalance();
				this.loadVotiumRewardsInformation();
			});

			observe(this.store.user, 'settBalances', () => {
				const areVaultBalancesAvailable = Object.keys(this.store.user.settBalances).length > 0;

				if (areVaultBalancesAvailable) {
					this.getUserDelegationState();
				}
			});
		}
	}

	get shouldBannerBeDisplayed(): boolean {
		if (!FLAGS.LOCKED_CVX_DELEGATION_WIDGET) {
			return false;
		}

		if (this.store.network.network.id !== NETWORK_IDS.ETH || !this.delegationState) {
			return false;
		}

		return this.delegationState !== DelegationState.Ineligible;
	}

	get canUserDelegate(): boolean {
		if (this.store.network.network.id !== NETWORK_IDS.ETH || !this.delegationState) {
			return false;
		}

		return this.delegationState === DelegationState.Eligible || this.delegationState === DelegationState.Delegated;
	}

	async loadLockedCvxBalance(): Promise<void> {
		const {
			wallet: { web3Instance, address },
			network: { network },
		} = this.store;

		if (network.id !== NETWORK_IDS.ETH || !address || !web3Instance) {
			return;
		}

		try {
			const cvxLocker = new web3Instance.eth.Contract(CvxLockerAbi as AbiItem[], mainnet.cvxLocker);
			this.lockedCVXBalance = new BigNumber(await cvxLocker.methods.balanceOf(address).call());
		} catch (error) {
			console.error('There was an error getting locked cvx balance: ', error);
			this.lockedCVXBalance = null;
		}
	}

	/**
	 * gets votium merkle tree from the votium Github repositories
	 */
	async getVotiumMerkleTree(): Promise<VotiumMerkleTree> {
		const [votiumRepoContent] = await fetchData<VotiumGithubTreeInformation>(votiumMerkleTreeUrl);

		if (!votiumRepoContent) {
			throw new Error('Votium Merkle Tree not available');
		}

		const badgerMerkleTreeFiles: VotiumTreeEntry[] = votiumRepoContent.tree.filter((content: VotiumTreeEntry) =>
			content.path.includes('merkle/BADGER/'),
		);

		const latestMerkleTree = badgerMerkleTreeFiles[badgerMerkleTreeFiles.length - 1];

		const merkleTreeContentRequest = await fetch(`${rawVotiumMerkleTreeUrl}/${latestMerkleTree.path}`);

		return await merkleTreeContentRequest.json();
	}

	async loadVotiumRewardsInformation(): Promise<void> {
		try {
			const {
				network: { network },
			} = this.store;

			if (network.id !== NETWORK_IDS.ETH) {
				return;
			}

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
			wallet: { address, web3Instance },
		} = this.store;

		let totalEarned = new BigNumber(0);
		if (!web3Instance || !address) {
			return totalEarned;
		}

		const votiumMerkleTreeContract = new web3Instance.eth.Contract(
			VotiumMerkleTreeAbi as AbiItem[],
			votiumRewardsContractAddress,
		);

		const claimedEvents = await votiumMerkleTreeContract.getPastEvents('Claimed', {
			fromBlock: 'earliest',
			filter: { token: mainnet.tokens.badger, account: address },
		});

		for (const claimedEvent of claimedEvents) {
			totalEarned = totalEarned.plus(claimedEvent.returnValues['amount']);
		}

		return totalEarned;
	}

	async getUnclaimedVotiumRewards(): Promise<BigNumber> {
		const {
			wallet: { web3Instance, address },
		} = this.store;

		let unclaimedBalance = new BigNumber(0);
		if (!web3Instance || !address) {
			return unclaimedBalance;
		}

		const merkleTree = await this.getVotiumMerkleTree();
		const merkleTreeReward = merkleTree.claims[Web3.utils.toChecksumAddress(address)];

		if (!merkleTreeReward) {
			return unclaimedBalance;
		}

		const votiumMerkleTreeContract = new web3Instance.eth.Contract(
			VotiumMerkleTreeAbi as AbiItem[],
			votiumRewardsContractAddress,
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
			wallet: { web3Instance, address },
		} = this.store;

		if (network.id !== NETWORK_IDS.ETH || !web3Instance || !address) {
			return;
		}

		const cvxLocker = new web3Instance.eth.Contract(CvxLockerAbi as AbiItem[], mainnet.cvxLocker);
		const lockedCVXBalance = new BigNumber(await cvxLocker.methods.balanceOf(address).call());

		if (!lockedCVXBalance.gt(0)) {
			this.delegationState = DelegationState.Ineligible;
			return;
		}

		const badgerDelegateAddress = await web3Instance.eth.ens.getAddress(BADGER_DELEGATE_ENS);
		const cvxDelegator = new web3Instance.eth.Contract(CvxDelegatorAbi as AbiItem[], mainnet.cvxDelegator);
		const alreadyDelegatedAddress = await cvxDelegator.methods.delegation(address, ID_TO_DELEGATE).call();

		if (alreadyDelegatedAddress && alreadyDelegatedAddress !== ethers.constants.AddressZero) {
			const isBadgerDelegatedAddress = alreadyDelegatedAddress === badgerDelegateAddress;

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
			wallet: { web3Instance, address },
		} = this.store;

		if (!web3Instance || !address) {
			return;
		}

		const merkleTree = await this.getVotiumMerkleTree();
		const merkleTreeClaim = merkleTree.claims[Web3.utils.toChecksumAddress(address)];

		if (!merkleTreeClaim) {
			console.error('Votium merkle tree not available');
			return;
		}

		const votiumMerkleTree = new web3Instance.eth.Contract(
			VotiumMerkleTreeAbi as AbiItem[],
			votiumRewardsContractAddress,
		);

		const { index, amount, proof } = merkleTreeClaim;

		const claimRewards = votiumMerkleTree.methods.claim(mainnet.tokens.badger, index, address, amount, proof);

		const options = await this.store.contracts.getMethodSendOptions(claimRewards);

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
			wallet: { web3Instance, address },
		} = this.store;

		if (!web3Instance || !address) {
			return;
		}

		const cvxDelegator = new web3Instance.eth.Contract(CvxDelegatorAbi as AbiItem[], mainnet.cvxDelegator);

		const badgerDelegateAddress = await web3Instance.eth.ens.getAddress(BADGER_DELEGATE_ENS);
		const setDelegate = cvxDelegator.methods.setDelegate(ID_TO_DELEGATE, badgerDelegateAddress);
		const options = await this.store.contracts.getMethodSendOptions(setDelegate);

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
