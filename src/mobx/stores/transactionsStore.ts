import firebase from 'firebase';
import GatewayJS from '@renproject/gateway';
import { extendObservable, action, observe } from 'mobx';

import fbase from 'fbase';
import { RootStore } from '../store';

class TransactionsStore {
	private store!: RootStore;
	private db!: firebase.firestore.Firestore;
	private gjs!: GatewayJS;
	public incompleteTransfer!: boolean;

	constructor(store: RootStore) {
                return;
		this.store = store;
		this.db = fbase.firestore();
		this.gjs = new GatewayJS('mainnet');

		extendObservable(this, {
			incompleteTransfer: false,
		});

		observe(this.store.wallet as any, 'connectedAddress', async (change: any) => {
			const provider = this.store.wallet.provider;
			if (!provider) return;
			if (change.oldValue !== change.newValue) {
				// Fetch old transactions and reload any incomplete tx.
				await this.fetchAndRecoverTx(change.newValue, provider);
			}
		});
	}

	fetchAndRecoverTx = action(async (userAddr: string, provider: any) => {
		const { queueNotification } = this.store.uiState;
		// Fetch any still pending tx.
		const results = await this.db
			.collection('transactions')
			.where('user', '==', userAddr)
			.where('status', 'not-in', [
				GatewayJS.LockAndMintStatus.ConfirmedOnEthereum,
				GatewayJS.BurnAndReleaseStatus.ReturnedFromRenVM,
				'deleted',
			])
			.get();
		results.forEach((doc) => {
			const tx = doc.data();
			queueNotification(`Recovering tx id (${tx.id}).`, 'info');
			if (_isGatewayJSTxComplete(tx.status)) return;
			const parsedTx = JSON.parse(tx.data);
			this.setIncompleteTransfer(true);
			this._reOpenTx(userAddr, provider, parsedTx);
		});
	});

	addTx = action(async (userAddr: string, tx: any) => {
		const { queueNotification } = this.store.uiState;
		// add timestamps
		const timestamp = firebase.firestore.Timestamp.fromDate(new Date(Date.now()));
		tx.created = timestamp;
		tx.updated = timestamp;

		// update firebase
		const id = tx.id;
		try {
			this.db
				.collection('transactions')
				.doc(id)
				.set({
					user: userAddr,
					id,
					created: timestamp,
					updated: timestamp,
					data: JSON.stringify(tx),
					status: tx.status,
				});
		} catch (e) {
			queueNotification(`Failed to store tx id (${id}): ${e.message}`, 'error');
		}
	});

	updateTx = action(async (userAddr: string, newTx: any) => {
		const { queueNotification } = this.store.uiState;

		if (!newTx.id) {
			queueNotification(`UpdateTx tx has no id: ${newTx}`, 'error');
			return;
		}

		// update timestamp
		newTx.updated = firebase.firestore.Timestamp.fromDate(new Date(Date.now()));

		// update firebase
		let docData;

		const doc = this.db.collection('transactions').doc(newTx.id);
		try {
			docData = await doc.get();
		} catch (e) {
			queueNotification(`Failed to fetch tx id (${newTx.id}): ${e.message}`, 'error');
			return;
		}

		if (docData?.exists) {
			try {
				await doc.update({
					data: JSON.stringify(newTx),
					user: userAddr,
					updated: newTx.updated,
					status: newTx.status,
				});
			} catch (e) {
				queueNotification(`Failed to update tx id (${newTx.id}): ${e.message}`, 'error');
			}
		} else {
			await this.addTx(userAddr, newTx);
		}
	});

	removeTx = action(async <T extends { id: string }>(tx: T, err?: Error) => {
		const { queueNotification } = this.store.uiState;

		if (!tx.id) {
			queueNotification(`RemoveTx tx has no id: ${tx}`, 'error');
			return;
		}
		try {
			const payload = {
				status: 'deleted',
				error: '',
			};
			if (err && err.message) {
				payload.error = err.message;
			}
			await this.db.collection('transactions').doc(tx.id).update(payload);
			this.setIncompleteTransfer(false);
		} catch (e) {
			queueNotification(`Failed to delete tx id (${tx.id}): ${e.message}`, 'error');
		}
	});

	setIncompleteTransfer = action((status: boolean) => {
		this.incompleteTransfer = status;
	});

	_reOpenTx = async (userAddr: string, provider: any, trade: any) => {
		const { queueNotification } = this.store.uiState;
		try {
			await this.gjs
				.recoverTransfer(provider, trade, trade.id)
				.pause()
				.result()
				.on('status', (status: any) => {
					const completed = _isGatewayJSTxComplete(status);
					if (completed) {
						this.removeTx(trade);
					}
				})
				.on('transferUpdated', (transfer: any) => {
					transfer.id = transfer.id || trade.id;
					if (!transfer.archived) {
						this.updateTx(userAddr, transfer);
					}
				});
		} catch (e) {
			this.removeTx(trade, e);
			queueNotification(`Failed to reopen tx id (${trade.id}): ${e.message}`, 'error');
		}
	};
}

const _isGatewayJSTxComplete = function (status: string) {
	return (
		status === GatewayJS.LockAndMintStatus.ConfirmedOnEthereum ||
		status === GatewayJS.BurnAndReleaseStatus.ReturnedFromRenVM
	);
};

export default TransactionsStore;
