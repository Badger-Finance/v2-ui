import { ethers } from 'ethers';
import { action, extendObservable } from 'mobx';

import GovernanceTimelockAbi from '../../config/system/abis/GovernanceTimelock.json';
import { TimelockEvent } from '../model/governance-timelock/timelock-event';

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

  constructor() {
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

    const proposedFilter = GovernanceContract.filters.CallScheduled();
    const proposedEventData = await GovernanceContract.queryFilter(
      proposedFilter,
      0,
      'latest',
    );
    const vetoedFilter = GovernanceContract.filters.CallDisputed();
    const vetoedEventData = await GovernanceContract.queryFilter(
      vetoedFilter,
      0,
      'latest',
    );
    const executedFilter = GovernanceContract.filters.CallExecuted();
    const executedEventData = await GovernanceContract.queryFilter(
      executedFilter,
      0,
      'latest',
    );
    const vetoResolvedFilter =
      GovernanceContract.filters.CallDisputedResolved();
    const vetoResolvedEventData = await GovernanceContract.queryFilter(
      vetoResolvedFilter,
      0,
      'latest',
    );

    const eventData = [
      ...proposedEventData,
      ...vetoedEventData,
      ...executedEventData,
      ...vetoResolvedEventData,
    ];
    eventData.sort(
      (a: ethers.Event, b: ethers.Event) =>
        b.blockNumber + b.logIndex - a.blockNumber + a.logIndex,
    );

    const timelockEventMap = new Map<string, TimelockEvent>();

    for (const eventitem of eventData) {
      if (eventitem.args) {
        const id = eventitem.args.id;
        const blockInfo = await provider.getBlock(eventitem.blockNumber);
        const timestamp = blockInfo.timestamp;
        const date = new Date(timestamp * 1000);
        const s = date.toUTCString();
        const utcDate = s.substring(0, s.indexOf('GMT')) + 'UTC';
        let timelockEvent = {} as TimelockEvent;

        timelockEvent = timelockEventMap.get(id) || timelockEvent;
        timelockEvent.doneBy = eventitem.args.sender || '';
        timelockEvent.status = eventitem.args.status || '';
        timelockEvent.timeStamp = utcDate;
        timelockEvent.timeRemaining = 0;
        timelockEvent.event = eventitem.event || '';
        if (eventitem.args.status === 'Proposed') {
          timelockEvent.proposer = timelockEvent.doneBy;
          timelockEvent.timeRemaining =
            eventitem.args.delay - Math.round(new Date().getTime() / 1000);
        }
        timelockEventMap.set(id, timelockEvent);
      }
    }
    this.timelockEvents = timelockEventMap;
  });
}
