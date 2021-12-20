import React, { useContext, useEffect, useRef, useState } from 'react';
import {
	Button,
	Checkbox,
	DialogContent,
	DialogTitle,
	FormControlLabel,
	Grid,
	IconButton,
	Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import clsx from 'clsx';
import { Currency } from '../../config/enums/currency.enum';
import Dialog from './dialogs/Dialog';

const useDialogStyles = (offsetHeight = 0) => {
	return makeStyles(() => ({
		dialog: {
			position: 'absolute',
			right: '2%',
			top: offsetHeight,
		},
	}));
};

const useStyles = makeStyles((theme) => ({
	paperSm: {
		maxWidth: 275,
	},
	title: {
		padding: theme.spacing(3, 3, 0, 3),
	},
	content: {
		padding: theme.spacing(2, 3, 3, 3),
	},
	closeButton: {
		position: 'absolute',
		right: 8,
		top: 16,
	},
	selectedOption: {
		border: `2px solid ${theme.palette.primary.main}`,
		color: theme.palette.primary.main,
	},
	nonSelectedOption: {
		border: '2px solid #848484',
	},
	option: {
		borderRadius: 8,
	},
	confirmButton: {
		marginTop: theme.spacing(4),
	},
	currencySection: {
		marginTop: theme.spacing(2),
	},
}));

const SettListFiltersWidget = (): JSX.Element => {
	const { uiState, onboard, network } = useContext(StoreContext);
	const widgetButton = useRef<HTMLButtonElement | null>(null);
	const [selectedCurrency, setSelectedCurrency] = useState(uiState.currency);
	const [selectedPortfolioView, setSelectedPortfolioView] = useState(uiState.showUserBalances);
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const classes = useStyles();
	const dialogClasses = useDialogStyles(widgetButton.current?.offsetTop ?? 0)();
	const currencyOptions = [Currency.USD, Currency.CAD, Currency.BTC, network.network.currency];

	const toggleDialog = () => setIsDialogOpen(!isDialogOpen);

	const applyChanges = () => {
		uiState.setCurrency(selectedCurrency);
		uiState.setShowUserBalances(selectedPortfolioView);
		setIsDialogOpen(false);
	};

	useEffect(() => {
		setSelectedCurrency(uiState.currency);
	}, [uiState.currency]);

	return (
		<>
			<IconButton onClick={toggleDialog} ref={widgetButton}>
				<img src="assets/icons/sett-list-filters.svg" alt="sett list filters" />
			</IconButton>
			<Dialog
				open={isDialogOpen}
				fullWidth
				maxWidth="sm"
				classes={{ paper: dialogClasses.dialog, paperWidthSm: classes.paperSm }}
				onClose={toggleDialog}
			>
				<DialogTitle className={classes.title}>
					Filters
					<IconButton className={classes.closeButton} onClick={toggleDialog}>
						<CloseIcon />
					</IconButton>
				</DialogTitle>
				<DialogContent className={classes.content}>
					<Grid container direction="column">
						{onboard.isActive() && (
							<Grid item>
								<FormControlLabel
									control={
										<Checkbox
											color="primary"
											checked={selectedPortfolioView}
											onChange={(event) => setSelectedPortfolioView(event.target.checked)}
										/>
									}
									label="Show only Portfolio"
								/>
							</Grid>
						)}
						<Grid item container className={clsx(onboard.isActive() && classes.currencySection)}>
							<Typography variant="subtitle1" color="textSecondary">
								CURRENCY
							</Typography>
							<Grid item container spacing={1} className={classes.currencySection}>
								{currencyOptions.map((currency, index) => (
									<Grid item key={`${currency}_${index}`}>
										<Button
											onClick={() => setSelectedCurrency(currency)}
											className={clsx(
												classes.option,
												currency === selectedCurrency
													? classes.selectedOption
													: classes.nonSelectedOption,
											)}
										>
											{currency}
										</Button>
									</Grid>
								))}
							</Grid>
						</Grid>
						<Button
							fullWidth
							onClick={applyChanges}
							className={classes.confirmButton}
							variant="contained"
							color="primary"
						>
							Apply Filters
						</Button>
					</Grid>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default observer(SettListFiltersWidget);