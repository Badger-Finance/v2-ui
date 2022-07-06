import { TransactionReceipt } from '@ethersproject/abstract-provider';
import { action, computed, makeObservable, observable } from 'mobx';

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
    return Array.from(this.recentTransactions.values()).filter(
      (transaction) => !transaction.status,
    );
  }

  get recentTransactions(): ChainTransactions {
    return (
      this.transactions.get(String(this.store.network.network.id)) ?? new Map()
    );
  }

  addSignedTransaction(transaction: Transaction): void {
    const chainId = String(this.store.network.network.id);
    const transactions = this.transactions.get(chainId);

    if (!transactions) {
      this.transactions.set(chainId, new Map());
    }

    // TODO: add support to persist pending transactions to local storage
    this.transactions.get(chainId)?.set(transaction.hash, transaction);
  }

  updateCompletedTransaction(receipt: TransactionReceipt): void {
    const chainId = String(this.store.network.network.id);
    const transactions = this.transactions.get(chainId);

    if (!transactions) return;

    const transaction = transactions.get(receipt.transactionHash);

    if (!transaction) return;

    transaction.status = receipt.status;
    const cloneTransactions = new Map(this.transactions);
    const latestTransactions = Array.from(transactions.entries()).slice(-3);

    cloneTransactions.set(chainId, new Map(latestTransactions));
    localStorage.setItem('transactions', stringifyMap(cloneTransactions));
  }

  clearTransactions(): void {
    this.transactions.get(String(this.store.network.network.id))?.clear();
    localStorage.setItem('transactions', JSON.stringify({}));
  }

  private loadTransactions() {
    const persistedTransactions = localStorage.getItem('transactions');
    if (persistedTransactions && persistedTransactions !== '{}') {
      const parsedMap = parseStringifyMap(persistedTransactions);
      if (!(parsedMap instanceof Map)) {
        console.error('Invalid persisted transactions', parsedMap);
      } else {
        this.transactions = parsedMap;
      }
    }
  }
}

export default TransactionsStore;
