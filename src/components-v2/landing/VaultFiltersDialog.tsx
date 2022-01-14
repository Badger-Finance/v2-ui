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
import clsx from 'clsx';

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
			backgroundColor: '#787880',
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
		justifyContent: 'flex-end',
		marginTop: theme.spacing(3),
		[theme.breakpoints.down('xs')]: {
			marginTop: theme.spacing(4),
			justifyContent: 'space-between',
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
	formControlLabelText: {
		fontWeight: 400,
	},
	checkboxLabel: {
		marginLeft: theme.spacing(1),
	},
	checkboxLabelRoot: {
		display: 'flex',
		alignItems: 'flex-start',
	},
	checkboxRoot: {
		paddingTop: 6,
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
						<Grid item xs={9}>
							<Typography variant="h6" className={classes.titleText}>
								Portfolio Dust
							</Typography>
							<Typography variant="body1" className={classes.caption}>
								Hide vaults valued under $1
							</Typography>
						</Grid>
						<Grid item xs={3} container className={classes.switchContainer}>
							<StyledSwitch
								checked={hidePortfolioDust}
								onClick={() => setHidePortfolioDust(!hidePortfolioDust)}
							/>
						</Grid>
					</Grid>
					<Divider className={classes.divider} />
					<Grid item container alignItems="center" spacing={1}>
						<Grid item xs={12} sm={7}>
							<Typography variant="h6" className={classes.titleText}>
								Vaults Currencies
							</Typography>
						</Grid>
						<Grid item xs={12} sm={5} container justifyContent="space-between">
							<Grid item xs={6}>
								<FormControlLabel
									value={Currency.BTC}
									control={<Radio color="primary" />}
									label={
										<Typography variant="body1" className={classes.formControlLabelText}>
											BTC
										</Typography>
									}
									checked={currency === Currency.BTC}
									onClick={() => setCurrency(Currency.BTC)}
								/>
							</Grid>
							<Grid item xs={6}>
								<FormControlLabel
									value={Currency.USD}
									control={<Radio color="primary" />}
									label={
										<Typography variant="body1" className={classes.formControlLabelText}>
											USD
										</Typography>
									}
									checked={currency === Currency.USD}
									onClick={() => setCurrency(Currency.USD)}
								/>
							</Grid>
						</Grid>
					</Grid>
					<Divider className={classes.divider} />
					<Grid item container>
						<Typography variant="h6" className={classes.titleText}>
							Protocols
						</Typography>
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
													label={
														<Typography
															variant="body1"
															className={clsx(
																classes.formControlLabelText,
																classes.checkboxLabel,
															)}
														>
															{protocol}
														</Typography>
													}
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
						<Typography variant="h6" className={classes.titleText}>
							Token
						</Typography>
						<Grid container className={classes.tokenSelection} spacing={2}>
							<Grid item xs={12} sm={6}>
								<FormControlLabel
									classes={{ root: classes.checkboxLabelRoot }}
									control={
										<Checkbox
											classes={{ root: classes.checkboxRoot }}
											checked={types.includes(VaultType.Native)}
											onChange={() => handleTypeChange(VaultType.Native)}
											name={VaultType.Native}
										/>
									}
									label={
										<div className={classes.checkboxLabel}>
											<Typography variant="body1" className={classes.formControlLabelText}>
												BadgerDAO tokens
											</Typography>
											<Typography variant="body1" className={classes.tokenCaption}>
												Badger, Digg
											</Typography>
										</div>
									}
								/>
							</Grid>
							<Grid item xs={12} sm={6}>
								<FormControlLabel
									classes={{ root: classes.checkboxLabelRoot }}
									control={
										<Checkbox
											classes={{ root: classes.checkboxRoot }}
											checked={types.includes(VaultType.Boosted)}
											onChange={() => handleTypeChange(VaultType.Boosted)}
											name={VaultType.Boosted}
										/>
									}
									label={
										<div className={classes.checkboxLabel}>
											<Typography variant="body1" className={classes.formControlLabelText}>
												Boosted Tokens
											</Typography>
											<Typography variant="body1" className={classes.tokenCaption}>
												ibBTC, crvsBTC LP, imBTC, Mhbtc, Cvxcrv, Tricrypto
											</Typography>
										</div>
									}
								/>
							</Grid>
							<Grid item xs={12} sm={6}>
								<FormControlLabel
									classes={{ root: classes.checkboxLabelRoot }}
									control={
										<Checkbox
											classes={{ root: classes.checkboxRoot }}
											checked={types.includes(VaultType.Standard)}
											onChange={() => handleTypeChange(VaultType.Standard)}
											name={VaultType.Standard}
										/>
									}
									label={
										<div className={classes.checkboxLabel}>
											<Typography variant="body1" className={classes.formControlLabelText}>
												Non-Boosted Tokens
											</Typography>
											<Typography variant="body1" className={classes.tokenCaption}>
												All other tokens (e.g. wBTC, renBTC...)
											</Typography>
										</div>
									}
								/>
							</Grid>
						</Grid>
					</Grid>
				</Grid>
				<Grid container className={classes.actionButtons} spacing={4}>
					<Grid item>
						<Button variant="text" onClick={handleClearAll} color="primary" className={classes.clearButton}>
							Clear All
						</Button>
					</Grid>
					<Grid item>
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
