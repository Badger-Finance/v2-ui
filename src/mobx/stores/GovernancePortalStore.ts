import { GovernanceProposalsList, Network } from '@badger-dao/sdk';
import { action, makeAutoObservable } from 'mobx';

import { RootStore } from './RootStore';

export class GovernancePortalStore {
  public contractAddress: string;
  public governanceProposals?: GovernanceProposalsList;
  public loadingProposals = false;
  public page = 1;
  public perPage = 2;
  constructor(private store: RootStore) {
    this.contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
    this.loadingProposals = false;

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

  updatePage = (network: Network, page: number) => {
    this.page = page;
    this.loadData(network, page);
  };

  updatePerPage = (network: Network, perPage: number) => {
    this.perPage = perPage;
    this.loadData(network, this.page, perPage);
  };
}
