import { GovernanceProposalsList, Network } from '@badger-dao/sdk';
import { ContractTransaction } from 'ethers';
import { action, makeAutoObservable } from 'mobx';

import { RootStore } from './RootStore';

export class GovernancePortalStore {
  public contractAddress: string;
  public governanceProposals?: GovernanceProposalsList;
  public loadingProposals = false;
  public vetoing = false;
  public page = 1;
  public perPage = 5;
  constructor(private store: RootStore) {
    this.contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

    makeAutoObservable(this, {
      loadData: action,
    });
  }

  async loadData(network = Network.Arbitrum, page = this.page, perPage = this.perPage): Promise<void> {
    const { api } = this.store;
    this.loadingProposals = true;
    try {
      this.governanceProposals = await api.loadGovernanceProposals(network, page, perPage);
      this.page = page;
    } catch (error) {
      console.log({
        error,
        message: 'Unable to get proposal list',
      });
    } finally {
      this.loadingProposals = false;
    }
  }

  async veto(id: string, callback?: (res: ContractTransaction | any, status: string) => void) {
    const { sdk } = this.store;
    this.vetoing = true;
    try {
      const res = await sdk.governance.timelockController.callDispute(id);
      if (callback) callback(res, 'success');
    } catch (error: any) {
      if (callback) callback(error, 'error');
      console.log({
        error,
        message: 'Unable to veto',
      });
    } finally {
      this.vetoing = false;
    }
  }

  // async unVeto() {
  //   const { sdk } = this.store;
  //   try {
  //     await sdk.governance.timelockController.callDisputeResolve();
  //   } catch (error) {

  //   }
  // }

  updatePage = (network: Network, page: number) => {
    this.page = page;
    this.loadData(network, page);
  };

  updatePerPage = (network: Network, perPage: number) => {
    this.perPage = perPage;
    this.loadData(network, this.page, perPage);
  };
}
