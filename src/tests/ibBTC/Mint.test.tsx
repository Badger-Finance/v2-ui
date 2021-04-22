import Ganache from 'ganache-core';
import Web3 from 'web3';
import store from 'mobx/store';

const PRIV_KEY_ONE = '0x990b68b61853f6418233b1f502a220a8770bb38849d9bd8fc552ed55f5899365';

export const startChain = () => {
	const provider = Ganache.provider({
		fork: 'https://mainnet.infura.io/v3/4c06e2847e1d456ea30506468ad0be5c',
		network_id: 1,
		accounts: [
			{
				secretKey: PRIV_KEY_ONE,
				balance: Web3.utils.toHex(1000),
			},
		],
	});
	const web3 = new Web3(provider as any);
	const wallet = web3.eth.accounts.privateKeyToAccount(PRIV_KEY_ONE);
	return { provider, wallet, web3 };
};

jest.setTimeout(30000);

it('should work (hopefully)', () => {
	const { wallet, web3 } = startChain();
	// store.wallet.provider = provider;
	// store.wallet.connectedAddress = wallet.address;
	return new Promise((resolve) => {
		web3.eth.getBalance(wallet.address, function (err, result) {
			if (err) {
				console.log(err);
			} else {
				console.log(web3.utils.fromWei(result, 'ether') + ' ETH');
			}
			resolve(result);
		});
	});
});
