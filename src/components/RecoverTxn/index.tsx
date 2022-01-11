import React, { FormEvent, useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import { StoreContext } from '../../mobx/store-context';
import PageHeader from '../../components-v2/common/PageHeader';
import { PageHeaderContainer, LayoutContainer } from '../../components-v2/common/Containers';
import { AmountTextField } from '../../components-v2/common/dialogs/styled';
import Button from '@material-ui/core/Button';

export const RecoverTxn = observer(() => {
	const { onboard } = useContext(StoreContext);
	const [txnId, setTxnId] = useState<string>('');
	const classes = useStyles();

	const handleTransactionFormSubmit = (event: FormEvent) => {
		event.preventDefault();
	};

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
							variant="outlined"
							fullWidth
							placeholder="Enter Transaction ID"
							value={txnId}
							onChange={(event: any) => setTxnId(event.target.value)}
						/>
						<Button
							className={classes.txnSubmitBtn}
							disabled={!txnId}
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
