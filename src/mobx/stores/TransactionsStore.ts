import { TransactionReceipt } from '@ethersproject/abstract-provider';
import { action, computed, makeObservable, observable } from 'mobx';
import { Chain } from 'mobx/model/network/chain';

import { Transaction } from '../model/ui/transaction';
import { parseStringifyMap, stringifyMap } from '../utils/helpers';
import { RootStore } from './RootStore';

type ChainTransactions = Map<string, Transaction>;
type MultiChainTransactions = Map<string, ChainTransactions>;

class TransactionsStore {
  transactions: MultiChainTransactions = new Map();

  constructor(private readonly store: RootStore) {
    makeObservable(this, {
      transactions: observable,
      transactionCount: computed,
      recentTransactions: computed,
      pendingTransactions: computed,
      addSignedTransaction: action,
      updateCompletedTransaction: action,
      clearTransactions: action,
    });

    this.loadTransactions();
  }

  get transactionCount(): number {
    return this.recentTransactions.size;
  }

  get pendingTransactions(): Transaction[] {
    return Array.from(this.recentTransactions.values()).filter((transaction) => !transaction.status);
  }

  get recentTransactions(): ChainTransactions {
    return this.transactions.get(String(Chain.getChain(this.store.chain.network).id)) ?? new Map();
  }

  addSignedTransaction(transaction: Transaction): void {
    const chainId = String(Chain.getChain(this.store.chain.network).id);
    const transactions = this.transactions.get(chainId);

    if (!transactions) {
      this.transactions.set(chainId, new Map());
    }

    this.transactions.get(chainId)?.set(transaction.hash, transaction);

    this.storeTransactionsLocally();
  }

  updateCompletedTransaction(receipt: TransactionReceipt): void {
    const chainId = String(Chain.getChain(this.store.chain.network).id);
    const transactions = this.transactions.get(chainId);

    if (!transactions) return;

    const transaction = transactions.get(receipt.transactionHash);

    if (!transaction) return;

    transaction.status = receipt.status;
    this.storeTransactionsLocally();
  }

  clearTransactions(): void {
    this.transactions.get(String(Chain.getChain(this.store.chain.network).id))?.clear();
    localStorage.setItem('transactions', JSON.stringify({}));
  }

  private storeTransactionsLocally(): void {
    const chainId = String(Chain.getChain(this.store.chain.network).id);
    const transactions = this.transactions.get(chainId);

    if (!transactions) return;

    const latestTransactions = Array.from(transactions.entries()).slice(-3);
    const cloneTransactions = new Map(this.transactions);
    cloneTransactions.set(chainId, new Map(latestTransactions));
    localStorage.setItem('transactions', stringifyMap(cloneTransactions));
  }

  private async loadTransactions() {
    // load completed transactions
    const persistedTransactions = localStorage.getItem('transactions');
    if (persistedTransactions && persistedTransactions !== '{}') {
      const parsedMap = parseStringifyMap(persistedTransactions);
      if (!(parsedMap instanceof Map)) {
        console.error('Invalid persisted transactions', parsedMap);
        return;
      }

      this.transactions = parsedMap;
      // check transactions for pending ones and see if they have resolved.
      this.pendingTransactions.map(async (t) => {
        this.loadPendingTransaction(t.hash, 9);
      });
    }
  }

  private async loadPendingTransaction(hash: string, retryTimes: number) {
    const receipt = await this.store.sdk.provider.getTransactionReceipt(hash);
    if (receipt != null) {
      this.updateCompletedTransaction(receipt);
    } else {
      if (retryTimes > 0) {
        setTimeout(() => this.loadPendingTransaction(hash, retryTimes - 1), 30 * 1000);
      } else {
        // retries have failed remove from transaction list
        this.transactions.get(String(Chain.getChain(this.store.chain.network).id))?.delete(hash);
        this.storeTransactionsLocally();
      }
    }
  }
}

export default TransactionsStore;
