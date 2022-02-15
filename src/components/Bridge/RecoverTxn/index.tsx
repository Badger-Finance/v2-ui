import React, { FormEvent, useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';
import { StoreContext } from '../../../mobx/store-context';
import { AmountTextField } from '../../../components-v2/common/dialogs/styled';
import Button from '@material-ui/core/Button';
import useSearchTxnById, { TxnSearch } from './hooks/search';
import { bridge_system, tokens } from 'config/deployments/mainnet.json';
import { RenVMParams, RenVMTransaction } from '../../../mobx/model/bridge/renVMTransaction';
import { EthArgs } from '@renproject/interfaces';
import { SearchResult } from './lib/searchResult';
import { Paper, Typography } from '@material-ui/core';

type ResumableTransaction = Partial<RenVMTransaction>;

const useStyles = makeStyles((theme) => ({
	wrapper: {
		padding: '1.4rem 2.4rem 1rem 2.4rem',
	},
	txnForm: {
		marginTop: '2em',
		display: 'flex',
		alignItems: 'center',
		[theme.breakpoints.only('xs')]: {
			flexDirection: 'column',
			alignItems: 'stretch',
		},
	},
	txnIdInput: {
		margin: '0 1em 0 0',
		flex: 1,
		[theme.breakpoints.only('xs')]: {
			margin: '0 0 1em 0',
		},
	},
	txnSubmitBtn: {
		height: 56,
		minWidth: 'fit-content',
		flex: 1,
	},
}));

export const RecoverTxn = observer(() => {
	const {
		uiState,
		onboard,
		bridge: { resumeTx },
	} = useContext(StoreContext);
	const [submitted, setSubmitted] = useState<boolean>(false);
	const [txnId, setTxnId] = useState<string>('');
	const { searchTxn, searchTxnLoading, searchByTxnId }: TxnSearch = useSearchTxnById();
	const classes = useStyles();

	const handleTransactionFormSubmit = (event: FormEvent) => {
		event.preventDefault();
		setSubmitted(true);
		searchByTxnId(txnId);
	};

	const createTxnParams = (searchTxn: SearchResult): ResumableTransaction => {
		const contractParams: EthArgs = [
			{
				name: '_token',
				type: 'address',
				value: tokens.renBTC,
			},
			{
				name: '_slippage',
				type: 'uint256',
				// for renBTC
				value: 0,
			},
			{
				name: '_user',
				type: 'address',
				value: onboard.address,
			},
			{
				name: '_vault',
				type: 'address',
				// for renBTC
				value: '0x0000000000000000000000000000000000000000',
			},
		];

		const params: RenVMParams = {
			asset: 'BTC',
			sendTo: bridge_system['adapter'],
			contractFn: 'mint',
			contractParams,
		};

		const txnParams: ResumableTransaction = {
			params,
			user: onboard.address,
			renVMMessage: 'Waiting for 6 confirmations.',
			renVMStatus: 'detected' as any,
			nonce: JSON.stringify(searchTxn?.queryTx?.result?.in?.nonce),
		};

		return txnParams;
	};

	useEffect(() => {
		if (!searchTxnLoading && submitted) {
			if (searchTxn) {
				const txn: ResumableTransaction = createTxnParams(searchTxn);
				resumeTx(txn as RenVMTransaction);
			} else {
				setTxnId('');
				uiState.queueError(`Couldn't retrieve transaction associated with this ID.`);
			}
			setSubmitted(false);
		}
	}, [searchTxn, searchTxnLoading, submitted, onboard, uiState, resumeTx, createTxnParams]);

	return (
		<Paper className={classes.wrapper}>
			<Typography variant="body1" color="textPrimary">
				Recover Transaction
			</Typography>
			<Typography variant="body2" color="textSecondary">
				Use your Bitcoin Transaction ID to recover.
			</Typography>
			<form className={classes.txnForm} onSubmit={handleTransactionFormSubmit}>
				<AmountTextField
					className={classes.txnIdInput}
					type="text"
					variant="outlined"
					fullWidth
					placeholder="Enter Transaction ID"
					value={txnId}
					onChange={(event: any) => setTxnId(event.target.value)}
				/>
				<Button
					className={classes.txnSubmitBtn}
					disabled={!txnId || searchTxnLoading}
					variant="outlined"
					type="submit"
					color="primary"
				>
					Recover Transaction
				</Button>
			</form>
		</Paper>
	);
});
