import React, { FormEvent, useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import { StoreContext } from '../../mobx/store-context';
import PageHeader from '../../components-v2/common/PageHeader';
import { PageHeaderContainer, LayoutContainer } from '../../components-v2/common/Containers';
import { AmountTextField } from '../../components-v2/common/dialogs/styled';
import Button from '@material-ui/core/Button';
import useSearchTxnById, { TxnSearch } from './hooks/search';
import { bridge_system, tokens } from 'config/deployments/mainnet.json';
import { RenVMParams, RenVMTransaction } from '../../mobx/model/bridge/renVMTransaction';
import { EthArgs } from '@renproject/interfaces';
import routes from '../../config/routes';
import { SearchResult } from './lib/searchResult';

type ResumableTransaction = Partial<RenVMTransaction>;

export const RecoverTxn = observer(() => {
	const {
		onboard,
		bridge: { resumeTx },
		router,
	} = useContext(StoreContext);
	const [txnId, setTxnId] = useState<string>('');
	const { searchTxn, searchTxnLoading, handleSearchByTxnId }: TxnSearch = useSearchTxnById();
	const classes = useStyles();

	const handleTransactionFormSubmit = (event: FormEvent) => {
		event.preventDefault();
		handleSearchByTxnId(txnId);
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
		if (!searchTxnLoading && searchTxn) {
			const txn: ResumableTransaction = createTxnParams(searchTxn);
			router.goTo(routes.bridge);
			resumeTx(txn as RenVMTransaction);
		}
	}, [searchTxn, searchTxnLoading, onboard, router, resumeTx, createTxnParams]);

	return (
		<LayoutContainer>
			<Grid container spacing={1} justify="flex-start">
				<PageHeaderContainer item xs={12}>
					<PageHeader title="Recover Transaction" subtitle="Use your Bitcoin Transaction ID to recover." />
				</PageHeaderContainer>
				<Grid item xs={12} md={8}>
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
							variant="contained"
							type="submit"
							color="primary"
						>
							Resume Transaction
						</Button>
					</form>
				</Grid>
			</Grid>
		</LayoutContainer>
	);
});

const useStyles = makeStyles((theme) => ({
	txnForm: {
		display: 'flex',
		alignItems: 'stretch',
	},
	txnIdInput: {
		margin: '0 1em 0 0',
	},
	txnSubmitBtn: {
		minWidth: 'fit-content',
	},
}));
