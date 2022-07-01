import { TransactionReceipt } from '@ethersproject/abstract-provider';
import { action, computed, makeObservable, observable } from 'mobx';

import { Transaction, TransactionMeta } from '../model/ui/transaction';
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
      (transaction) => !transaction.receipt,
    );
  }

  get recentTransactions(): ChainTransactions {
    return (
      this.transactions.get(String(this.store.network.network.id)) ?? new Map()
    );
  }

  addSignedTransaction(hash: string, meta: TransactionMeta): void {
    const chainId = String(this.store.network.network.id);
    const transactions = this.transactions.get(chainId);

    if (!transactions) {
      this.transactions.set(chainId, new Map());
    }

    this.transactions.get(chainId)?.set(hash, {
      hash,
      ...meta,
    });
  }

  updateCompletedTransaction(receipt: TransactionReceipt): void {
    const chainId = String(this.store.network.network.id);
    const transactions = this.transactions.get(chainId);
    if (!transactions) return;
    const transaction = transactions.get(receipt.transactionHash);
    if (!transaction) return;
    transaction.receipt = receipt;
    localStorage.setItem(
      'transactions',
      JSON.stringify(Array.from(this.transactions.entries())),
    );
  }

  clearTransactions(): void {
    this.transactions.get(String(this.store.network.network.id))?.clear();
    localStorage.setItem('transactions', JSON.stringify({}));
  }

  private loadTransactions() {
    const persistedTransactions = localStorage.getItem('transactions');
    if (persistedTransactions) {
      this.transactions = new Map(
        Object.entries(JSON.parse(persistedTransactions)),
      );
    }
  }
}

export default TransactionsStore;
