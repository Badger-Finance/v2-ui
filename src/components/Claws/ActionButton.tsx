import React from 'react';
import { Button, makeStyles } from '@material-ui/core';
import { useConnectWallet } from 'mobx/utils/hooks';
import { StoreContext } from 'mobx/store-context';

interface Props {
	text: string;
	onClick: () => void;
	disabled?: boolean;
}

const useStyles = makeStyles((theme) => ({
	button: {
		width: '80%',
		marginTop: theme.spacing(4),
		marginBottom: theme.spacing(2),
		margin: 'auto',
		[theme.breakpoints.only('xs')]: {
			width: '100%',
		},
	},
}));

export function ActionButton({ text, onClick, disabled = false }: Props) {
	const store = React.useContext(StoreContext);
	const classes = useStyles();
	const connect = useConnectWallet();

	if (!store.wallet.connectedAddress) {
		return (
			<Button
				color="primary"
				onClick={() => connect()}
				variant="contained"
				size="large"
				className={classes.button}
			>
				Connect Wallet
			</Button>
		);
	}

	return (
		<Button
			color="primary"
			disabled={disabled}
			onClick={onClick}
			variant="contained"
			size="large"
			className={classes.button}
		>
			{text}
		</Button>
	);
}
