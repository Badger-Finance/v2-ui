import { action, extendObservable } from 'mobx';
import { RootStore } from 'mobx/RootStore';
import { TimelockEvent } from '../model/governance-timelock/timelock-event';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import GovernanceTimelockAbi from '../../config/system/abis/GovernanceTimelock.json';

export class GovernancePortalStore {
	private store: RootStore;

	public contract_address?: string;
	public admin_address?: string;
	public guardian_address?: string;
	public timelock_events?: TimelockEvent[];

	constructor(store: RootStore) {
		this.store = store;

		extendObservable(this, {
			timelock_events: this.timelock_events,
		});

		this.contract_address = '0x21CF9b77F88Adf8F8C98d7E33Fe601DC57bC0893';

		this.loadData();
	}

	loadData = action(
		async (): Promise<void> => {
			const web3 = new Web3(Web3.givenProvider || 'ws://localhost:8545');
			const GovernanceContract = new web3.eth.Contract(GovernanceTimelockAbi as AbiItem[], this.contract_address);

			this.admin_address = await GovernanceContract.methods.admin().call();
			this.guardian_address = await GovernanceContract.methods.guardian().call();

			const eventData = await GovernanceContract.getPastEvents('allEvents', {
				fromBlock: 0,
				toBlock: 'latest',
			});

			this.timelock_events = eventData
				.sort((a: any, b: any) => (b.blockNumber + b.id > a.blockNumber + a.id ? 1 : -1))
				.map((eventData: any) => {
					const signature = eventData.returnValues.signature;
					const parameters = signature.substring(signature.indexOf('(') + 1, signature.lastIndexOf(')'));
					eventData.functionName = signature.split('(')[0];
					eventData.parameterTypes = parameters.split(',');

					try {
						eventData.decodedParameters = web3.eth.abi.decodeParameters(
							parameters.split(','),
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
