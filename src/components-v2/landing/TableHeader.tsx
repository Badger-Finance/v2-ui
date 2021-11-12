import { Grid, makeStyles, Typography } from '@material-ui/core';
import CurrencyDisplay from 'components-v2/common/CurrencyDisplay';
import React from 'react';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
	root: {
		paddingLeft: theme.spacing(2),
		marginBottom: theme.spacing(2),
	},
	hiddenMobile: {
		display: 'flex',
		alignItems: 'flex-end',
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
	displayValue: string | undefined;
}

export default function TableHeader(props: TableHeaderProps): JSX.Element {
	const { title, displayValue } = props;
	const classes = useStyles();

	// leave 3 grid spaces for the action buttons section which has no column name
	return (
		<Grid item container className={classes.root}>
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
			<Grid item xs={12} md={2} className={clsx(classes.hiddenMobile, classes.title)}>
				<Typography variant="body2" color="textSecondary">
					Yearly ROI
				</Typography>
			</Grid>
			<Grid item xs={12} md={2} className={clsx(classes.hiddenMobile, classes.title)}>
				<Typography variant="body2" color="textSecondary">
					TVL
				</Typography>
			</Grid>
		</Grid>
	);
}
