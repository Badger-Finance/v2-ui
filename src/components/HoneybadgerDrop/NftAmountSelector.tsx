import React from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import {
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	FormControl,
	FormHelperText,
	Input,
} from '@material-ui/core';
import { NFT } from 'mobx/model';

interface Props {
	isOpen?: boolean;
	nft: NFT;
	onClose: () => void;
	onAmountSelected: (tokenId: NFT['tokenId'], amount: number) => void;
}

const useStyles = makeStyles((theme: Theme) => ({
	redeemButton: {
		color: theme.palette.common.black,
	},
}));

export const NftAmountSelector: React.FC<Props> = ({ isOpen = false, nft, onClose, onAmountSelected }) => {
	const classes = useStyles();
	const [amount, setAmount] = React.useState<undefined | number>(1);

	React.useEffect(() => {
		setAmount(1);
	}, []);

	return (
		<Dialog onClose={onClose} aria-labelledby="nft-amount-dialog-title" open={isOpen}>
			<DialogTitle id="nft-amount-dialog-title">NFT Amount</DialogTitle>
			<DialogContent>
				<DialogContentText>Select the amount of NFTs you want to redeem</DialogContentText>
				<FormControl>
					<Input
						id="nft-amount"
						type="number"
						placeholder="NFT amount to redeem"
						value={amount || ''}
						inputProps={{ min: 1, max: nft.balance, step: 1 }}
						onChange={(event: any) => {
							const input = Math.floor(Number(event.target.value));
							setAmount(input);
						}}
					/>
					<FormHelperText id="nft-amount-helper-text">{`Min: 1 - Max:${nft.balance}`}</FormHelperText>
				</FormControl>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose} color="primary">
					Cancel
				</Button>
				<Button
					variant="contained"
					className={classes.redeemButton}
					disabled={!amount || amount < 1 || amount > +nft.balance}
					onClick={() => {
						if (!amount) return;
						onAmountSelected(nft.tokenId, amount);
					}}
					color="primary"
				>
					Redeem
				</Button>
			</DialogActions>
		</Dialog>
	);
};
