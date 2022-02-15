import { Bitcoin, BitcoinCash, DigiByte, Dogecoin, Filecoin, Terra, Zcash } from '@renproject/chains';
import { TerraNetwork } from '@renproject/chains-terra/build/main/api/deposit';
import { RenNetwork } from '@renproject/interfaces';

import { ChainDetails } from './types';

export const BitcoinDetails: ChainDetails<Bitcoin> = {
	chain: 'Bitcoin',
	nativeAssets: [{ symbol: 'BTC', name: 'Bitcoin' }],
	chainPattern: /^(bitcoin|btc)$/i,
	usePublicProvider: (network: RenNetwork) => Bitcoin(network === RenNetwork.Mainnet ? 'mainnet' : 'testnet'),
};

export const ZcashDetails: ChainDetails<Zcash> = {
	chain: 'Zcash',
	nativeAssets: [{ symbol: 'ZEC', name: 'Zcash' }],
	chainPattern: /^(zcash|zec)$/i,
	usePublicProvider: (network: RenNetwork) => Zcash(network === RenNetwork.Mainnet ? 'mainnet' : 'testnet'),
};

export const BitcoinCashDetails: ChainDetails<BitcoinCash> = {
	chain: 'BitcoinCash',
	nativeAssets: [{ symbol: 'BCH', name: 'BitcoinCash' }],
	chainPattern: /^(bitcoincash|bch)$/i,
	usePublicProvider: (network: RenNetwork) => BitcoinCash(network === RenNetwork.Mainnet ? 'mainnet' : 'testnet'),
};

export const DibiByteDetails: ChainDetails<DigiByte> = {
	chain: 'DibiByte',
	nativeAssets: [{ symbol: 'DGB', name: 'DibiByte' }],
	chainPattern: /^(dibibyte|dgb)$/i,
	usePublicProvider: (network: RenNetwork) => DigiByte(network === RenNetwork.Mainnet ? 'mainnet' : 'testnet'),
};

export const FilecoinDetails: ChainDetails<Filecoin> = {
	chain: 'Filecoin',
	nativeAssets: [{ symbol: 'FIL', name: 'Filecoin' }],
	chainPattern: /^(filecoin|fil)$/i,
	usePublicProvider: (network: RenNetwork) => Filecoin(network === RenNetwork.Mainnet ? 'mainnet' : 'testnet'),
};

export const LunaDetails: ChainDetails<Terra> = {
	chain: 'Luna',
	nativeAssets: [{ symbol: 'LUNA', name: 'Luna' }],
	chainPattern: /^(luna|terra)$/i,
	usePublicProvider: (network: RenNetwork) => {
		// @ts-ignore
		return Terra(network === RenNetwork.Mainnet ? TerraNetwork.Columbus : TerraNetwork.Tequila);
	},
};

export const DogecoinDetails: ChainDetails<Dogecoin> = {
	chain: 'Dogecoin',
	nativeAssets: [{ symbol: 'DOGE', name: 'Dogecoin' }],
	chainPattern: /^(dogecoin|doge)$/i,
	usePublicProvider: (network: RenNetwork) => Dogecoin(network === RenNetwork.Mainnet ? 'mainnet' : 'testnet'),
};
