import ganacheProvider from '../utils/integrations-provider';
import Web3 from 'web3';
import '@testing-library/jest-dom';
import { mockApi } from './utils/apiV2';
import { EthNetwork } from '../mobx/model';

mockApi();

const PRIV_KEY = '0x990b68b61853f6418233b1f502a220a8770bb38849d9bd8fc552ed55f5899365';

const provider = ganacheProvider({
	fork: 'https://mainnet.infura.io/v3/4c06e2847e1d456ea30506468ad0be5c',
	network_id: 1,
	accounts: [{ secretKey: PRIV_KEY, balance: Web3.utils.toHex(1000) }],
});

const web3 = new Web3(provider as any);
test.skip('woop', () => {
	const connectedAddress = web3.eth.accounts.privateKeyToAccount(PRIV_KEY).address;
	console.log(connectedAddress);
	console.log('Mock provider works!');
});

jest.spyOn(EthNetwork.prototype, 'getGasPrices').mockReturnValue(
	Promise.resolve({
		rapid: 153000000000 / 1e9,
		fast: 147000000000 / 1e9,
		standard: 140000000000 / 1e9,
		slow: 127000000000 / 1e9,
	}),
);

/* it.skip('does not time out', async () => {
	const connectedAddress = web3.eth.accounts.privateKeyToAccount(PRIV_KEY).address;
	console.log(connectedAddress);
	const network = new EthNetwork();
	const tokens = network.tokens;

	const { batchCall: batch } = reduceContractConfig(tokens.tokenBatches, { connectedAddress });

	const priceApi = getTokenPrices(network.name, network.currency);
	const batchCall = new BatchCall({ web3 });

	// clean this up, but force async
	await Promise.all([priceApi, batchCall.execute(batch)])
		.then((result: any[]) => {
			const cgPrices = _.mapValues(result.slice(0, 1)[0], (price: any) => ({
				ethValue: new BigNumber(price).multipliedBy(1e18),
			}));
			const tokenContracts = _.keyBy(reduceBatchResult(_.flatten(result.slice(1, 2))), 'address');
			const updatedTokens = _.compact(
				_.values(
					_.defaultsDeep(
						cgPrices,
						tokenContracts,
						_.mapValues(tokens.symbols, (value: string, address: string) => ({
							address,
							symbol: value,
						})),
						_.mapValues(tokens.names, (value: string, address: string) => ({
							address,
							name: value,
						})),
					),
				),
			);

			console.log('updated tokens =>', updatedTokens);
		})
		.catch((error: any) => process.env.REACT_APP_BUILD_ENV !== 'production' && console.log('batch error: ', error));
	console.log(':)');
}); */
