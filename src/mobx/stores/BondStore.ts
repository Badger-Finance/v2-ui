import { extendObservable } from 'mobx';
import { RootStore } from 'mobx/RootStore';
import { DEBUG } from '../../config/environment';
import BadgerSDK from '@badger-dao/sdk';
import { allBonds, Beneficiary, CitadelBond } from 'pages/CitadelEarlyBonding/bonds.config';
import { CitadelSale__factory, ERC20__factory } from 'contracts';
import { TokenBalance } from 'mobx/model/tokens/token-balance';
import { ETH_DEPLOY } from 'mobx/model/network/eth.network';
import BigNumber from 'bignumber.js';
import { BigNumber as BigNumberEthers, ethers } from 'ethers';

interface CitadelBondInfo {
	tokenRatio: number;
	tokenPrice: number;
	purchasedTokens: number;
	purchasedTokensValue: number;
	purchasedBonds: number;
	purchasedBondsValue: BigNumber;
}

/**
 * TODO: Clean up general ethers contract call support
 */
export class BondStore {
	public bonds: CitadelBond[];
	constructor(private store: RootStore) {
		this.bonds = [];
		extendObservable(this, {
			bonds: this.bonds,
		});
	}

	async updateBonds() {
		const { onboard } = this.store;
		const { provider, address } = onboard;
		if (!provider || !address) {
			return;
		}
		const sdk = new BadgerSDK(provider.network, provider);
		const loadedBonds: CitadelBond[] = [];
		await Promise.all(
			allBonds.map(async (b) => {
				try {
					const contract = CitadelSale__factory.connect(b.bondAddress, provider.getSigner());
					const [token, ended, finalized, price, userPurchased, totalPurchased, totalSold, claimed] =
						await Promise.all([
							contract.tokenIn(),
							contract.saleEnded(),
							contract.finalized(),
							contract.tokenOutPrice(),
							contract.boughtAmounts(address),
							contract.totalTokenIn(),
							contract.totalTokenOutBought(),
							contract.hasClaimed(address),
						]);
					const bondToken = await sdk.tokens.loadToken(token);
					const bond = {
						address: token,
						bondToken,
						bondAddress: b.bondAddress,
						price,
						start: BigNumberEthers.from('0'),
						finalized,
						ended,
						bondType: b.bondType,
						userPurchased,
						totalPurchased,
						totalSold,
						claimed,
					};
					loadedBonds.push(bond);
				} catch (err) {
					if (DEBUG) {
						console.error(`Failed to load ${b.bondAddress} ${b.bondType} bond!`);
						console.error(err);
					}
				}
			}),
		);
		this.bonds = loadedBonds;
	}

	async bond(bond: CitadelBond, amount: TokenBalance, beneficiary: Beneficiary): Promise<void> {
		const { onboard } = this.store;
		const { provider, address } = onboard;
		if (!provider || !address) {
			return;
		}
		console.log(`Triggered a bonding event for ${bond.address} (${amount.balanceDisplay()})`);
		const beneficiaryId = 0; // TODO: look up from some set table
		const sale = CitadelSale__factory.connect(bond.bondAddress, provider.getSigner());
		if (!sale) {
			if (DEBUG) {
				throw Error('Sale contract not defined for bond');
			}
			return;
		}
		const bondProof: string[] = []; // look up proof from user store account details
		try {
			const bondingToken = ERC20__factory.connect(bond.address, provider.getSigner());
			const allowance = await bondingToken.allowance(address, bond.bondAddress);
			// console.log({ allowance: allowance.toString(), amount: amount.tokenBalance.toString() })
			if (allowance.lt(amount.tokenBalance.toString())) {
				await bondingToken.approve(bond.bondAddress, ethers.constants.MaxUint256);
			}
			const tx = await sale.buy(amount.tokenBalance.toString(), beneficiaryId, bondProof);
			await tx.wait();
			await Promise.all([this.updateBonds(), this.store.user.reloadBalances()]);
		} catch (err) {
			if (DEBUG) {
				console.log(err);
			}
		}
	}

	async claim(bond: CitadelBond): Promise<void> {
		const { onboard } = this.store;
		const { provider, address } = onboard;
		if (!provider || !address) {
			return;
		}
		console.log(`Triggered a claim event for ${bond.address}`);
		const sale = CitadelSale__factory.connect(bond.bondAddress, provider.getSigner());
		if (!sale) {
			if (DEBUG) {
				throw Error('Sale contract not defined for bond');
			}
			return;
		}
		try {
			const tx = await sale.claim();
			await tx.wait();
			await Promise.all([this.updateBonds(), this.store.user.reloadBalances()]);
		} catch (err) {
			if (DEBUG) {
				console.log(err);
			}
		}
	}

	getBondInfo(bond: CitadelBond): CitadelBondInfo {
		let tokenRatio = 0;
		if (bond.price) {
			const basePrice = Number(ethers.utils.formatUnits(bond.price, bond.bondToken.decimals));
			tokenRatio = 1 / basePrice;
		}

		const { bondToken } = bond;
		// const bondedTokenPrice = prices.getPrice(bond.bondToken.address);
		const bondTokenPrice = this.store.prices.getPrice(ETH_DEPLOY.tokens.wBTC);
		const tokenPrice = Number(bondTokenPrice.toString()) / tokenRatio;

		// citadel token has 9 decimals - we can dynamically update this potentially
		const purchasedTokens = Number(ethers.utils.formatUnits(bond.userPurchased, 9));
		const purchasedTokensValue = tokenPrice * purchasedTokens;
		const purchasedBonds = Number(ethers.utils.formatUnits(bond.totalPurchased, bondToken.decimals));
		const purchasedBondsValue = bondTokenPrice.multipliedBy(purchasedBonds);

		return {
			tokenPrice,
			tokenRatio,
			purchasedTokens,
			purchasedTokensValue,
			purchasedBonds,
			purchasedBondsValue,
		};
	}
}

export default BondStore;
