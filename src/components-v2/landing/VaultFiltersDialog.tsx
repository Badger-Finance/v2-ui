import React, { useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Protocol, VaultType } from '@badger-dao/sdk/lib/api/enums';
import {
	Button,
	Checkbox,
	Dialog,
	DialogContent,
	DialogTitle,
	Divider,
	FormControlLabel,
	FormGroup,
	Grid,
	IconButton,
	makeStyles,
	Radio,
	Switch,
	Typography,
	useTheme,
	withStyles,
} from '@material-ui/core';
import { StoreContext } from '../../mobx/store-context';
import CloseIcon from '@material-ui/icons/Close';
import { Currency } from '../../config/enums/currency.enum';

const StyledSwitch = withStyles((theme) => ({
	root: {
		width: '51px',
		height: '31px',
		padding: 0,
	},
	track: {
		borderRadius: '17px',
		opacity: 1,
	},
	switchBase: {
		padding: 2,
		'&$checked': {
			color: '#04BF00',
			'& + $track': {
				backgroundColor: '#04BF00',
				opacity: 1,
			},
		},
		'& + $track': {
			backgroundColor: 'rgba(120, 120, 128, 0.16)',
		},
	},
	checked: {}, // this is empty on purpose to override checked styles
	thumb: {
		width: '27px',
		height: '27px',
		color: theme.palette.common.white,
	},
}))(Switch);

const useStyles = makeStyles((theme) => ({
	title: {
		padding: '24px 40px 31px 40px',
	},
	content: {
		padding: '0px 40px 31px 40px',
		[theme.breakpoints.down('xs')]: {
			padding: '0px 30px 31px 30px',
		},
	},
	divider: {
		width: '100%',
		margin: theme.spacing(3, 0),
	},
	actionButtons: {
		marginTop: theme.spacing(5),
		[theme.breakpoints.down('xs')]: {
			marginTop: 37,
		},
	},
	titleText: {
		fontWeight: 700,
		fontSize: 20,
	},
	closeButton: {
		position: 'absolute',
		right: 30,
		top: 16,
	},
	applyFilter: {
		width: 180,
	},
	caption: {
		color: '#848484',
		fontWeight: 400,
	},
	tokenCaption: {
		fontWeight: 400,
		color: '#C3C3C3',
	},
	protocolSelection: {
		marginTop: theme.spacing(1),
	},
	tokenSelection: {
		marginTop: theme.spacing(1),
	},
	clearButton: {
		padding: 0,
	},
	switchContainer: {
		[theme.breakpoints.down('xs')]: {
			justifyContent: 'flex-end',
		},
	},
}));

interface Props {
	open: boolean;
	onClose: () => void;
}

const VaultFiltersDialog = ({ open, onClose }: Props): JSX.Element => {
	const { uiState, vaults } = useContext(StoreContext);
	const classes = useStyles();
	const [hidePortfolioDust, setHidePortfolioDust] = useState(vaults.vaultsFilters.hidePortfolioDust);
	const [currency, setCurrency] = useState(vaults.vaultsFilters.currency || uiState.currency);
	const [protocols, setProtocols] = useState(vaults.vaultsFilters.protocols);
	const [types, setTypes] = useState(vaults.vaultsFilters.types);
	const closeDialogTransitionDuration = useTheme().transitions.duration.leavingScreen;

	const vaultMap = vaults.getVaultMap();

	const handleProtocolChange = (protocol: Protocol) => {
		if (protocols.includes(protocol)) {
			setProtocols(protocols.filter((filteredProtocol) => filteredProtocol !== protocol));
		} else {
			setProtocols([...protocols, protocol]);
		}
	};

	const handleTypeChange = (type: VaultType) => {
		if (types.includes(type)) {
			setTypes(types.filter((filteredType) => filteredType !== type));
		} else {
			setTypes([...types, type]);
		}
	};

	const handleSave = () => {
		vaults.vaultsFilters = {
			...vaults.vaultsFilters,
			...(currency ? { currency } : {}),
			protocols,
			types,
			hidePortfolioDust,
		};
		onClose();
	};

	const handleClearAll = () => {
		setHidePortfolioDust(false);
		setCurrency(vaults.vaultsFilters.currency || uiState.currency);
		setProtocols([]);
		setTypes([]);
	};

	const handleClose = () => {
		onClose();
		setTimeout(() => {
			setCurrency(vaults.vaultsFilters.currency || uiState.currency);
			setProtocols(vaults.vaultsFilters.protocols);
			setTypes(vaults.vaultsFilters.types);
		}, closeDialogTransitionDuration);
	};

	useEffect(() => {
		setHidePortfolioDust(vaults.vaultsFilters.hidePortfolioDust);
		setProtocols(vaults.vaultsFilters.protocols);
		setCurrency(vaults.vaultsFilters.currency);
		setTypes(vaults.vaultsFilters.types);
	}, [vaults.vaultsFilters]);

	return (
		<Dialog open={open}>
			<DialogTitle disableTypography className={classes.title}>
				<Typography variant="h6" className={classes.titleText}>
					Filters
				</Typography>
				<IconButton aria-label="close vault filters" className={classes.closeButton} onClick={handleClose}>
					<CloseIcon />
				</IconButton>
			</DialogTitle>
			<DialogContent className={classes.content}>
				<Grid container>
					<Grid item container>
						<Grid item xs={8}>
							<Typography variant="body1">PORTFOLIO DUST</Typography>
							<Typography variant="body1" className={classes.caption}>
								Hide vaults valued under $1
							</Typography>
						</Grid>
						<Grid item xs={4} container className={classes.switchContainer}>
							<StyledSwitch
								checked={hidePortfolioDust}
								onClick={() => setHidePortfolioDust(!hidePortfolioDust)}
							/>
						</Grid>
					</Grid>
					<Divider className={classes.divider} />
					<Grid item container alignItems="center" spacing={1}>
						<Grid item xs={12} sm={5}>
							<Typography variant="body1">VAULTS CURRENCIES</Typography>
						</Grid>
						<Grid item xs={12} sm={7} container justifyContent="space-between">
							<Grid item xs={6}>
								<FormControlLabel
									value={Currency.BTC}
									control={<Radio color="primary" />}
									label="BTC"
									checked={currency === Currency.BTC}
									onClick={() => setCurrency(Currency.BTC)}
								/>
							</Grid>
							<Grid item xs={6}>
								<FormControlLabel
									value={Currency.USD}
									control={<Radio color="primary" />}
									label="USD"
									checked={currency === Currency.USD}
									onClick={() => setCurrency(Currency.USD)}
								/>
							</Grid>
						</Grid>
					</Grid>
					<Divider className={classes.divider} />
					<Grid item container>
						<Typography variant="body1">PROTOCOLS</Typography>
						{vaultMap && (
							<FormGroup className={classes.protocolSelection}>
								<Grid container spacing={2}>
									{[...new Set(Object.values(vaultMap).map((vault) => vault.protocol))].map(
										(protocol, index) => (
											<Grid item xs={6} sm={4} key={`${protocol}_${index}`}>
												<FormControlLabel
													control={
														<Checkbox
															checked={protocols.includes(protocol)}
															onChange={() => handleProtocolChange(protocol)}
															name={protocol}
														/>
													}
													label={protocol}
												/>
											</Grid>
										),
									)}
								</Grid>
							</FormGroup>
						)}
					</Grid>
					<Divider className={classes.divider} />
					<Grid container>
						<Typography variant="body1">TOKENS</Typography>
						<Grid container className={classes.tokenSelection} spacing={2}>
							<Grid item xs={12} sm={6}>
								<FormControlLabel
									control={
										<Checkbox
											checked={types.includes(VaultType.Native)}
											onChange={() => handleTypeChange(VaultType.Native)}
											name={VaultType.Native}
										/>
									}
									label={
										<>
											<Typography variant="body1">BadgerDAO tokens</Typography>
											<Typography variant="body1" className={classes.tokenCaption}>
												Badger, Digg
											</Typography>
										</>
									}
								/>
							</Grid>
							<Grid item xs={12} sm={6}>
								<FormControlLabel
									control={
										<Checkbox
											checked={types.includes(VaultType.Boosted)}
											onChange={() => handleTypeChange(VaultType.Boosted)}
											name={VaultType.Boosted}
										/>
									}
									label={
										<>
											<Typography variant="body1">Boosted Tokens</Typography>
											<Typography variant="body1" className={classes.tokenCaption}>
												ibBTC, crvsBTC LP, imBTC, Mhbtc, Cvxcrv, Tricrypto
											</Typography>
										</>
									}
								/>
							</Grid>
							<Grid item xs={12} sm={6}>
								<FormControlLabel
									control={
										<Checkbox
											checked={types.includes(VaultType.Standard)}
											onChange={() => handleTypeChange(VaultType.Standard)}
											name={VaultType.Standard}
										/>
									}
									label={
										<>
											<Typography variant="body1">Non-Boosted Tokens</Typography>
											<Typography variant="body1" className={classes.tokenCaption}>
												All other tokens (e.g. wBTC, renBTC...)
											</Typography>
										</>
									}
								/>
							</Grid>
						</Grid>
					</Grid>
				</Grid>
				<Grid container className={classes.actionButtons} justifyContent="space-between">
					<Grid item xs={4}>
						<Button variant="text" onClick={handleClearAll} color="primary" className={classes.clearButton}>
							Clear All
						</Button>
					</Grid>
					<Grid item xs={8} container justifyContent="flex-end">
						<Button
							variant="contained"
							onClick={handleSave}
							color="primary"
							className={classes.applyFilter}
						>
							Apply Filters
						</Button>
					</Grid>
				</Grid>
			</DialogContent>
		</Dialog>
	);
};

export default observer(VaultFiltersDialog);
