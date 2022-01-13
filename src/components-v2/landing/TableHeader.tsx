import { Grid, makeStyles, Typography } from '@material-ui/core';
import CurrencyDisplay from 'components-v2/common/CurrencyDisplay';
import React, { useContext } from 'react';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';

const useStyles = makeStyles((theme) => ({
	hiddenMobile: {
		display: 'flex',
		[theme.breakpoints.down('sm')]: {
			display: 'none',
		},
	},
	amount: {
		marginLeft: 5,
	},
	title: {
		textTransform: 'uppercase',
	},
	container: {
		[theme.breakpoints.up('md')]: {
			flexGrow: 0,
			maxWidth: '70%',
			flexBasis: '70%',
		},
	},
	tokensSection: {
		[theme.breakpoints.up('md')]: {
			flexGrow: 0,
			maxWidth: '45%',
			flexBasis: '45%',
		},
	},
}));

interface TableHeaderProps {
	title: string;
	displayValue?: string;
}

const TableHeader = observer((props: TableHeaderProps): JSX.Element => {
	const { uiState } = useContext(StoreContext);
	const { title, displayValue } = props;
	const classes = useStyles();

	// leave 3 grid spaces for the action buttons section which has no column name
	return (
		<Grid item container>
			<Grid item container className={classes.container}>
				<Grid item container xs={12} md alignItems="center" className={classes.tokensSection}>
					<Grid item>
						<Typography className={classes.title} variant="body2" color="textSecondary">
							{title}
						</Typography>
					</Grid>
					<Grid item className={classes.amount}>
						<CurrencyDisplay displayValue={displayValue} variant="body1" justifyContent="flex-start" />
					</Grid>
				</Grid>
				<Grid
					item
					container
					xs={12}
					md
					alignItems="center"
					className={clsx(classes.hiddenMobile, classes.title)}
				>
					<Typography variant="body2" color="textSecondary">
						APR
					</Typography>
				</Grid>
				<Grid
					item
					container
					xs={12}
					md
					alignItems="center"
					className={clsx(classes.hiddenMobile, classes.title)}
				>
					<Typography variant="body2" color="textSecondary">
						{uiState.showUserBalances ? 'Assets' : 'TVL'}
					</Typography>
				</Grid>
			</Grid>
		</Grid>
	);
});

export default TableHeader;
