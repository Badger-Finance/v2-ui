import { BurnAndReleaseParamsSimple, LockAndMintParamsSimple } from '@renproject/interfaces';
import firebase from 'firebase';

export type RenVMTransaction = {
	// ID is the pkey in the db.
	id: string;
	user: string;
	// Nonce monotonically increases per account tx.
	nonce: number;
	encodedTx: string; // json encoded tx data.
	// NB: The web3Provider field is not encoded (for obvious reasons).
	params: LockAndMintParamsSimple | BurnAndReleaseParamsSimple;
	status: string;
	// Record if there was an error processing a tx.
	error: string;
	updated: firebase.firestore.Timestamp;
	created: firebase.firestore.Timestamp;
	deleted: boolean;
};
