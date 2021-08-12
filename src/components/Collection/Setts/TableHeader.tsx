import { Grid, makeStyles, Typography } from '@material-ui/core';
import CurrencyDisplay from 'components-v2/common/CurrencyDisplay';
import React from 'react';

const useStyles = makeStyles((theme) => ({
	root: {
		padding: theme.spacing(0, 0, 1, 2),
	},
	vauleItem: {
		paddingLeft: theme.spacing(3),
	},
	hiddenMobile: {
		[theme.breakpoints.down('sm')]: {
			display: 'none',
		},
		display: 'flex',
		alignItems: 'flex-end',
	},
}));

interface TableHeaderProps {
	title: string;
	period: string;
	displayValue: string | undefined;
}

export default function TableHeader(props: TableHeaderProps): JSX.Element {
	const { title, period, displayValue } = props;
	const classes = useStyles();

	const samplePeriods: { [period: string]: string } = {
		month: 'Monthly',
		year: 'Yearly',
	};

	return (
		<Grid container className={classes.root}>
			{/*leave 3 grid spaces for the action buttons section which has no column name*/}
			<Grid item container xs={12} md={9}>
				<Grid item container xs={12} sm={5}>
					<Grid item>
						<Typography variant="body1" color="textPrimary">
							{title}
						</Typography>
					</Grid>
					<Grid item>
						<CurrencyDisplay displayValue={displayValue} variant="body1" justify="flex-start" />
					</Grid>
				</Grid>
				<Grid item xs={12} sm className={classes.hiddenMobile}>
					<Typography variant="body2" color="textSecondary">
						{samplePeriods[period]} ROI
					</Typography>
				</Grid>
				<Grid item xs={12} sm className={classes.hiddenMobile}>
					<Typography variant="body2" color="textSecondary">
						Value
					</Typography>
				</Grid>
			</Grid>
		</Grid>
	);
}
