import { Grid, makeStyles, Typography } from '@material-ui/core';
import CurrencyDisplay from 'components-v2/common/CurrencyDisplay';
import React from 'react';

const useStyles = makeStyles((theme) => ({
	headerContainer: {
		marginBottom: theme.spacing(1),
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
	tokenTitle: string;
	period: string;
	displayValue: string;
}

export default function TableHeader(props: TableHeaderProps): JSX.Element {
	const { title, tokenTitle, period, displayValue } = props;
	const classes = useStyles();

	const samplePeriods: { [period: string]: string } = {
		month: 'Monthly',
		year: 'Yearly',
	};

	return (
		<Grid container className={classes.headerContainer}>
			<Grid item container xs={12} sm={4} className={classes.vauleItem} spacing={1}>
				<Grid item>
					<Typography variant="body1" color="textPrimary">
						{title}
					</Typography>
				</Grid>
				<Grid item>
					<CurrencyDisplay displayValue={displayValue} variant="body1" justify="flex-start" />
				</Grid>
			</Grid>
			<Grid item xs={12} sm={4} md={2} className={classes.hiddenMobile}>
				<Typography variant="body2" color="textSecondary">
					{tokenTitle}
				</Typography>
			</Grid>
			<Grid item xs={12} sm={4} md={2} className={classes.hiddenMobile}>
				<Typography variant="body2" color="textSecondary">
					{samplePeriods[period]} ROI
				</Typography>
			</Grid>
			<Grid item xs={12} sm={6} md={2} className={classes.hiddenMobile}>
				<Typography variant="body2" color="textSecondary">
					Value
				</Typography>
			</Grid>
		</Grid>
	);
}
