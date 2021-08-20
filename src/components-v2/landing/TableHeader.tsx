import { Grid, makeStyles, Typography } from '@material-ui/core';
import CurrencyDisplay from 'components-v2/common/CurrencyDisplay';
import React from 'react';

const useStyles = makeStyles((theme) => ({
	root: {
		paddingLeft: theme.spacing(2),
	},
	hiddenMobile: {
		display: 'flex',
		alignItems: 'flex-end',
		[theme.breakpoints.down('sm')]: {
			display: 'none',
		},
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

	// leave 3 grid spaces for the action buttons section which has no column name
	return (
		<Grid item container xs={12} md={9} className={classes.root}>
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
	);
}
