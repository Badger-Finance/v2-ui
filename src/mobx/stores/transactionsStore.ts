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
		this.store = store;
		this.db = fbase.firestore();
		this.gjs = new GatewayJS('testnet');

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
		console.log('fetchAndRecoverTx() -> ', userAddr, provider);
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
		console.log('results ->', results.docs);
		results.forEach((doc) => {
			const tx = doc.data();
			console.log('tx found -> ', tx);
			if (_isGatewayJSTxComplete(tx.status)) return;
			const parsedTx = JSON.parse(tx.data);
			console.log('REOPEN', userAddr, tx);
			this.setIncompleteTransfer(true);
			this._reOpenTx(userAddr, provider, parsedTx);
		});
	});

	addTx = action(async (userAddr: string, tx: any) => {
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
			const errorMessage = String(e && e.message);
			e.message = `Unable to store transaction to database${errorMessage ? `: ${errorMessage}` : '.'}`;
			throw e;
		}
	});

	updateTx = action(async (userAddr: string, newTx: any) => {
		if (!newTx.id) {
			console.error(`updateTx tx has no id: ${newTx}`);
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
			console.error(e);
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
				console.error(e);
			}
		} else {
			await this.addTx(userAddr, newTx);
		}
	});

	removeTx = action(async <T extends { id: string }>(tx: T) => {
		if (!tx.id) {
			console.error(`removeTx tx has no id: ${tx}`);
			return;
		}
		try {
			console.log('updating tx to be deleted');
			await this.db.collection('transactions').doc(tx.id).update({
				status: 'deleted',
			});
			this.setIncompleteTransfer(false);
		} catch (e) {
			console.error(e);
		}
	});

	setIncompleteTransfer = action((status: boolean) => {
		this.incompleteTransfer = status;
	});

	_reOpenTx = async (userAddr: string, provider: any, trade: any) => {
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
					console.info(`[REOPEN STATUS] ${status}`, trade);
				})
				.on('transferUpdated', (transfer: any) => {
					console.info(`[REOPEN TRANSFER]`, transfer);
					transfer.id = transfer.id || trade.id;
					if (!transfer.archived) {
						this.updateTx(userAddr, transfer);
					}
				});
		} catch (err) {
			// console.log("REOPEN #2", trade)
			this.removeTx(trade);
			console.error(`error re-opening tx: ${err.message}`);
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
