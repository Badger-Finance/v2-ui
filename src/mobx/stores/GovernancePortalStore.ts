import { GovernanceTimelock__factory } from 'contracts';
import { ethers } from 'ethers';
import { action, extendObservable } from 'mobx';

import { TimelockEvent } from '../model/governance-timelock/timelock-event';
import { RootStore } from './RootStore';

// Defined for now, will be used when signature will be shown in UI
// const getParameterTypes = (signature: string) => {
//   const parametersStart = signature.indexOf('(') + 1;
//   const parametersEnd = signature.lastIndexOf(')');
//   const parameters = signature.substring(parametersStart, parametersEnd);
//   return parameters.split(',');
// };

export class GovernancePortalStore {
  public contractAddress: string;
  public timelockEvents?: Map<string, TimelockEvent>;

  constructor(private store: RootStore) {
    this.contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
    extendObservable(this, {
      timelockEvents: this.timelockEvents,
    });
  }

  loadData = action(async (): Promise<void> => {
    const { sdk } = this.store;
    const timelock = GovernanceTimelock__factory.connect(this.contractAddress, sdk.provider);

    const proposedFilter = timelock.filters.CallScheduled();
    const proposedEventData = await timelock.queryFilter(proposedFilter, 0, 'latest');
    const vetoedFilter = timelock.filters.CallDisputed();
    const vetoedEventData = await timelock.queryFilter(vetoedFilter, 0, 'latest');
    const executedFilter = timelock.filters.CallExecuted();
    const executedEventData = await timelock.queryFilter(executedFilter, 0, 'latest');
    const vetoResolvedFilter = timelock.filters.CallDisputedResolved();
    const vetoResolvedEventData = await timelock.queryFilter(vetoResolvedFilter, 0, 'latest');

    const eventData = [...proposedEventData, ...vetoedEventData, ...executedEventData, ...vetoResolvedEventData];
    eventData.sort((a: ethers.Event, b: ethers.Event) => b.blockNumber + b.logIndex - a.blockNumber + a.logIndex);

    const timelockEventMap = new Map<string, TimelockEvent>();

    for (const eventItem of eventData) {
      if (eventItem.args) {
        const id = eventItem.args.id;
        const blockInfo = await sdk.provider.getBlock(eventItem.blockNumber);
        const timestamp = blockInfo.timestamp;
        const date = new Date(timestamp * 1000);
        const s = date.toUTCString();
        const utcDate = s.substring(0, s.indexOf('GMT')) + 'UTC';
        let timelockEvent = {} as TimelockEvent;

        timelockEvent = timelockEventMap.get(id) || timelockEvent;
        timelockEvent.doneBy = eventItem.args.sender || '';
        timelockEvent.status = eventItem.args.status || '';
        timelockEvent.timeStamp = utcDate;
        timelockEvent.timeRemaining = 0;
        timelockEvent.event = eventItem.event || '';
        if (eventItem.args.status === 'Proposed') {
          timelockEvent.proposer = timelockEvent.doneBy;
          // TODO: figure out if this is correct at all
          timelockEvent.timeRemaining = Number(eventItem.args[6].toString()) - Math.round(new Date().getTime() / 1000);
        }
        timelockEventMap.set(id, timelockEvent);
      }
    }
    this.timelockEvents = timelockEventMap;
  });
}
