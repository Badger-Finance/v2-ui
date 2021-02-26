import { Grid, Typography } from '@material-ui/core';
import React from 'react';

interface TableHeaderProps {
	title: string;
	tokenTitle: string;
	classes: Record<'chip' | 'header' | 'title' | 'list' | 'listItem' | 'before' | 'hiddenMobile', string>;
	period: string;
}

export default function TableHeader(props: TableHeaderProps): JSX.Element {
	const { title, tokenTitle, classes, period } = props;
	const spacer = () => <div className={classes.before} />;
	return (
		<>
			{spacer()}
			<Grid item xs={12}>
				<Grid container className={classes.header}>
					<Grid item xs={12} sm={4}>
						<Typography variant="body1" color="textPrimary">
							{title}
						</Typography>
					</Grid>

					<Grid item xs={12} sm={4} md={2} className={classes.hiddenMobile}>
						<Typography variant="body2" color="textSecondary">
							{tokenTitle}
						</Typography>
					</Grid>

					<Grid item xs={12} sm={4} md={2} className={classes.hiddenMobile}>
						<Typography variant="body2" color="textSecondary">
							{({ year: 'Yearly', day: 'Daily', month: 'Monthly' } as any)[period]} ROI
						</Typography>
					</Grid>

					<Grid item xs={12} sm={6} md={2} className={classes.hiddenMobile}>
						<Typography variant="body2" color="textPrimary">
							Value
						</Typography>
					</Grid>
				</Grid>
			</Grid>
		</>
	);
}
