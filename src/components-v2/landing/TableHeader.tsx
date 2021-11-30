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
}));

interface TableHeaderProps {
	title: string;
	displayValue?: string;
}

const TableHeader = observer(
	(props: TableHeaderProps): JSX.Element => {
		const { uiState } = useContext(StoreContext);
		const { title, displayValue } = props;
		const classes = useStyles();

		// leave 3 grid spaces for the action buttons section which has no column name
		return (
			<Grid item container>
				<Grid item container xs={12} md={5} alignItems="center">
					<Grid item>
						<Typography className={classes.title} variant="body2" color="textSecondary">
							{title}
						</Typography>
					</Grid>
					<Grid item className={classes.amount}>
						<CurrencyDisplay displayValue={displayValue} variant="body1" justify="flex-start" />
					</Grid>
				</Grid>
				<Grid
					item
					container
					xs={12}
					md={2}
					alignItems="center"
					className={clsx(classes.hiddenMobile, classes.title)}
				>
					<Typography variant="body2" color="textSecondary">
						Variable APR
					</Typography>
				</Grid>
				<Grid
					item
					container
					xs={12}
					md={2}
					alignItems="center"
					className={clsx(classes.hiddenMobile, classes.title)}
				>
					<Typography variant="body2" color="textSecondary">
						{uiState.showUserBalances ? 'Assets' : 'TVL'}
					</Typography>
				</Grid>
			</Grid>
		);
	},
);

export default TableHeader;
