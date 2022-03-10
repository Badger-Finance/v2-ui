import { action, extendObservable } from 'mobx';
import { RootStore } from 'mobx/RootStore';
import { TimelockEvent } from '../model/governance-timelock/timelock-event';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import GovernanceTimelockAbi from '../../config/system/abis/GovernanceTimelock.json';
import { ethers } from 'ethers';

const getParameterTypes = (signature: string) => {
	const parametersStart = signature.indexOf('(') + 1;
	const parametersEnd = signature.lastIndexOf(')');
	const parameters = signature.substring(parametersStart, parametersEnd);
	return parameters.split(',');
};

export class GovernancePortalStore {
	public contractAddress: string;
	public timelockEvents?: Map<string, TimelockEvent>;
	constructor(store: RootStore) {
		this.contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
		extendObservable(this, {
			timelockEvents: this.timelockEvents,
		});
	}

	loadData = action(async (): Promise<void> => {
		const provider = new ethers.providers.JsonRpcProvider();
		const GovernanceContract = new ethers.Contract(
			this.contractAddress,
			GovernanceTimelockAbi,
			provider.getSigner(0),
		);

		let proposedFilter = GovernanceContract.filters.CallScheduled();
		const proposedEventData = await GovernanceContract.queryFilter(proposedFilter, 0, 'latest');
		let vetoedFilter = GovernanceContract.filters.CallDisputed();
		const vetoedEventData = await GovernanceContract.queryFilter(vetoedFilter, 0, 'latest');
		let executedFilter = GovernanceContract.filters.CallExecuted();
		const executedEventData = await GovernanceContract.queryFilter(executedFilter, 0, 'latest');
		let vetoResolvedFilter = GovernanceContract.filters.CallDisputedResolved();
		const vetoResolvedEventData = await GovernanceContract.queryFilter(vetoResolvedFilter, 0, 'latest');

		const eventData = [...proposedEventData, ...vetoedEventData, ...executedEventData, ...vetoResolvedEventData];
		eventData.sort((a: any, b: any) => b.blockNumber + b.id - a.blockNumber + a.id);

		var timelockEventMap = new Map<string, TimelockEvent>();

		for (let eventitem of eventData) {
			console.log(eventitem);
			if (eventitem.args) {
				console.log(eventitem.args.id);
				let id = eventitem.args.id;
				const blockInfo = await provider.getBlock(eventitem.blockNumber);
				var timestamp: any = blockInfo.timestamp;
				var date: any = new Date(timestamp * 1000);
				var s = date.toUTCString();
				var utcDate = s.substring(0, s.indexOf('GMT')) + 'UTC';
				var timelockEvent = {} as TimelockEvent;

				timelockEvent = timelockEventMap.get(id) || timelockEvent;
				timelockEvent.doneBy = eventitem.args.sender || '';
				timelockEvent.status = eventitem.args.status || '';
				timelockEvent.timeStamp = utcDate;
				timelockEvent.timeRemaining = 0;
				timelockEvent.event = eventitem.event || '';
				if (eventitem.args.status == 'Proposed') {
					timelockEvent.proposer = timelockEvent.doneBy;
					timelockEvent.timeRemaining = eventitem.args.delay - Math.round(new Date().getTime() / 1000);
				}
				timelockEventMap.set(id, timelockEvent);
			}
		}
		this.timelockEvents = timelockEventMap;
	});
}
