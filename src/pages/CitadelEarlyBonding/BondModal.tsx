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
	Grid,
} from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import CloseIcon from '@material-ui/icons/Close';
import React, { useContext, useState } from 'react';
import BondInput from './BondInput';
import BondPricing, { EarlyBondMetric } from './BondPricing';
import { Beneficiary, CitadelBond } from './bonds.config';
import { TokenBalance } from 'mobx/model/tokens/token-balance';
import { bondToCitadel } from './bonds.utils';

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
		marginTop: theme.spacing(3),
		marginBottom: theme.spacing(3),
	},
	beneficiaryItem: {
		display: 'flex',
		alignItems: 'center',
		color: '#C3C3C3',
	},
	beneficiaryIcon: {
		marginLeft: theme.spacing(0.5),
		marginRight: theme.spacing(1.5),
	},
	selectContainer: {
		borderRadius: '10px',
		marginTop: theme.spacing(4),
	},
	disclaimer: {
		color: '#A6A4A2',
	},
}));

interface BondModalProps {
	bond: CitadelBond | null;
	qualifications: Beneficiary[];
	clear: () => void;
}

const BondModal = observer(({ bond, qualifications, clear }: BondModalProps): JSX.Element | null => {
	const classes = useStyles();

	// TODO: Set a beneficiary they are able to use
	const [bondAmount, setBondAmount] = useState<TokenBalance | null>(null);
	const [beneficiary, setBeneficiary] = useState<string>('');

	if (bond === null) {
		return null;
	}

	const { token, address, bondType } = bond;
	const tokenName = token.toLowerCase();
	const store = useContext(StoreContext);
	const bondTokenBalance = store.user.getTokenBalance(address);

	const importantPricing = qualifications.length > 4 || qualifications.length === 0;

	return (
		<Modal
			open={bond !== null}
			onClose={() => {
				setBeneficiary('');
				clear();
			}}
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
					<div>
						<Typography variant="caption" align="left">
							{bondType} Bond
						</Typography>
						<Typography variant="h5" align="left">
							{token} Bond
						</Typography>
					</div>
					<IconButton className={classes.closeButton} onClick={() => clear()}>
						<CloseIcon />
					</IconButton>
				</div>
				<Typography variant="body2">
					This bond allows users to buy CTDL from the protocol in exchange for {token}.
				</Typography>
				<Grid container spacing={2} className={classes.pricingContainer}>
					<Grid item xs={12} sm={importantPricing ? 12 : 8}>
						<BondPricing bond={bond} />
					</Grid>
					<Grid item xs={12} sm={importantPricing ? 12 : 4}>
						<EarlyBondMetric metric="Qualifying Lists" value={qualifications.join(', ')} />
					</Grid>
				</Grid>
				<Divider />
				<FormControl fullWidth>
					<Select
						className={classes.selectContainer}
						placeholder={'Select beneficiary'}
						value={beneficiary}
						variant="outlined"
						MenuProps={{
							anchorOrigin: {
								vertical: 'bottom',
								horizontal: 'left',
							},
							transformOrigin: {
								vertical: 'top',
								horizontal: 'left',
							},
							getContentAnchorEl: null,
						}}
						onChange={(event) => setBeneficiary(event.target.value as Beneficiary)}
					>
						{Object.keys(Beneficiary).map((beneficiary, i) => (
							<MenuItem key={i} value={beneficiary}>
								<div className={classes.beneficiaryItem}>
									<img
										src={`/assets/icons/${beneficiary.toLowerCase()}.png`}
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
				<Button
					disabled={beneficiary === '' || bondAmount?.tokenBalance.eq(0)}
					variant="contained"
					color="primary"
					className={classes.bondButton}
					onClick={() => {
						if (!bondAmount) {
							return;
						}
						bondToCitadel(bond, bondAmount, beneficiary as Beneficiary);
					}}
				>
					Bond {token}
				</Button>
				<Typography variant="caption" className={classes.disclaimer}>
					*sCTDL will be available in your wallet upon bonding, however will not be active until Citadel
					opening at {new Date().toLocaleString()}.
				</Typography>
			</Paper>
		</Modal>
	);
});

export default BondModal;
