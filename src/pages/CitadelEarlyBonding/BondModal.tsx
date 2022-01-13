import {
	Modal,
	Paper,
	Backdrop,
	makeStyles,
	Typography,
	Button,
	Divider,
	IconButton,
	FormControl,
	MenuItem,
	Select,
} from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import CloseIcon from '@material-ui/icons/Close';
import React, { useContext, useState } from 'react';
import BondInput from './BondInput';
import BondPricing from './BondPricing';
import { IBond } from './bonds.config';
import { TokenBalance } from 'mobx/model/tokens/token-balance';

const useStyles = makeStyles((theme) => ({
	modalContainer: {
		display: 'flex',
		flexGrow: 1,
		alignItems: 'center',
		justifyContent: 'center',
		[theme.breakpoints.down('md')]: {
			marginLeft: theme.spacing(2),
			marginRight: theme.spacing(2),
		},
	},
	closeButton: {
		marginLeft: 'auto',
	},
	bondingPaper: {
		maxWidth: '570px',
		borderRadius: '10px',
		paddingLeft: '51px',
		paddingRight: '51px',
		paddingTop: '33px',
		paddingBottom: '42px',
		[theme.breakpoints.down('xs')]: {
			padding: theme.spacing(2),
			maxWidth: '398px',
		},
	},
	citadelIcon: {
		display: 'flex',
		height: '85px',
		marginLeft: theme.spacing(-3),
		marginBottom: theme.spacing(0.75),
	},
	bondHeader: {
		display: 'flex',
		alignItems: 'center',
		paddingBottom: theme.spacing(0.5),
	},
	bondButton: {
		width: '100%',
		marginBottom: theme.spacing(1.5),
		marginTop: theme.spacing(3),
	},
	pricingContainer: {
		display: 'flex',
		width: '75%',
		alignContent: 'flex-end',
		marginTop: theme.spacing(2),
		marginBottom: theme.spacing(-2),
	},
	beneficiaryItem: {
		display: 'flex',
		alignItems: 'center',
		padding: theme.spacing(1),
	},
	beneficiaryIcon: {
		marginLeft: theme.spacing(0.5),
		marginRight: theme.spacing(1.5),
	},
	selectContainer: {
		borderRadius: '10px',
	},
}));

enum Beneficiary {
	Olympus = 'Olympus',
	Redacted = 'Redacted',
	Frax = 'Frax',
	Alchemix = 'Alchemix',
	Tokemak = 'Tokemak',
	Abracadabra = 'Abracadabra',
	Convex = 'Convex',
	Badger = 'Badger',
}

interface BondModalProps {
	bond: IBond | null;
	clear: () => void;
}

const BondModal = observer(({ bond, clear }: BondModalProps): JSX.Element | null => {
	const classes = useStyles();

	// TODO: Set a beneficiary they are able to use
	const [bondAmount, setBondAmount] = useState<TokenBalance | null>(null);
	const [beneficiary, setBeneficiary] = useState<Beneficiary>(Beneficiary.Badger);

	if (bond === null) {
		return null;
	}

	const { token, address } = bond;
	const tokenName = token.toLowerCase();
	const store = useContext(StoreContext);
	const bondTokenBalance = store.user.getTokenBalance(address);

	console.log(Object.keys(Beneficiary));
	return (
		<Modal
			open={bond !== null}
			onClose={() => clear()}
			className={classes.modalContainer}
			BackdropComponent={Backdrop}
			BackdropProps={{
				timeout: 500,
			}}
			aria-labelledby="bond-modal"
			aria-describedby="Early Bonding Modal"
		>
			<Paper className={classes.bondingPaper}>
				<div className={classes.bondHeader}>
					<img src={`/assets/icons/${tokenName}.png`} alt={`${tokenName}`} width={35} height={35} />
					<img src={`/assets/icons/citadel.svg`} className={classes.citadelIcon} alt="Citadel" />
					<Typography variant="h5" align="left">
						{token} Bond
					</Typography>
					<IconButton className={classes.closeButton} onClick={() => clear()}>
						<CloseIcon />
					</IconButton>
				</div>
				<Typography variant="body2">
					This bond allows users to buy CTDL from the protocol in exchange for {token}.
				</Typography>
				<div className={classes.pricingContainer}>
					<BondPricing token={token} tokenAddress={address} />
				</div>
				<Divider />
				<FormControl fullWidth>
					<Select className={classes.selectContainer} value={beneficiary}>
						{Object.keys(Beneficiary).map((beneficiary, i) => (
							<MenuItem key={i} value={beneficiary}>
								<div className={classes.beneficiaryItem}>
									<img
										src={`/assets/icons/${tokenName}.png`}
										alt={`${tokenName}`}
										width={23}
										height={23}
										className={classes.beneficiaryIcon}
									/>
									<Typography variant="body1" align="left">
										{beneficiary}
									</Typography>
								</div>
							</MenuItem>
						))}
					</Select>
				</FormControl>
				<BondInput tokenBalance={bondTokenBalance} onChange={(balance) => setBondAmount(balance)} />
				<Button variant="contained" color="primary" className={classes.bondButton}>
					Bond {token}
				</Button>
				<Typography variant="caption">
					*sCTDL will be available in your wallet upon bonding, however will not be active until Citadel
					opening at {new Date().toLocaleString()}.
				</Typography>
			</Paper>
		</Modal>
	);
});

export default BondModal;
