import { action, extendObservable } from 'mobx';
import { RootStore } from 'mobx/RootStore';
import { TimelockEvent } from '../model/governance-timelock/timelock-event';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import GovernanceTimelockAbi from '../../config/system/abis/GovernanceTimelock.json';

export class GovernancePortalStore {
	private store: RootStore;

	public contractAddress?: string;
	public adminAddress?: string;
	public guardianAddress?: string;
	public timelockEvents?: TimelockEvent[];

	constructor(store: RootStore) {
		this.store = store;
		this.contractAddress = '0x21CF9b77F88Adf8F8C98d7E33Fe601DC57bC0893';

		extendObservable(this, {
			timelockEvents: this.timelockEvents,
		});
	}

	loadData = action(
		async (): Promise<void> => {
			const provider = this.store.wallet.provider || Web3.givenProvider;
			const web3 = new Web3(provider);
			const GovernanceContract = new web3.eth.Contract(GovernanceTimelockAbi as AbiItem[], this.contractAddress);

			this.adminAddress = await GovernanceContract.methods.admin().call();
			this.guardianAddress = await GovernanceContract.methods.guardian().call();

			const eventData = await GovernanceContract.getPastEvents('allEvents', {
				fromBlock: 0,
				toBlock: 'latest',
			});

			const getParametersTypes = (signature: string) => {
				const parametersStart = signature.indexOf('(') + 1;
				const parametersEnd = signature.lastIndexOf(')');
				const parameters = signature.substring(parametersStart, parametersEnd);
				return parameters.split(',');
			};

			this.timelockEvents = eventData
				.sort((a: any, b: any) => b.blockNumber + b.id - a.blockNumber + a.id)
				.map((eventData: any) => {
					const signature = eventData.returnValues.signature;
					eventData.functionName = signature.split('(')[0];
					eventData.parameterTypes = getParametersTypes(signature);

					try {
						eventData.decodedParameters = web3.eth.abi.decodeParameters(
							eventData.parameterTypes,
							eventData.returnValues.data,
						);
					} catch {
						eventData.decodedParameters = false;
					}

					return eventData;
				});
		},
	);
}
