import React from 'react';
import { Typography, makeStyles } from '@material-ui/core';

export interface PageHeaderProps {
	title: string;
	subtitle?: string;
}

const useStyles = makeStyles((theme) => ({
	headerWidgets: {
		display: 'flex',
		alignItems: 'center',
		[theme.breakpoints.down('sm')]: {
			justifyContent: 'center',
		},
	},
	headerContainer: {
		display: 'flex',
		[theme.breakpoints.down('xs')]: {
			flexDirection: 'column',
		},
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	headerContent: {},
}));

const PageHeader: React.FC<PageHeaderProps> = (props: PageHeaderProps) => {
	const classes = useStyles();
	const { title, subtitle } = props;
	return (
		<div className={classes.headerContainer}>
			<div className={classes.headerContent}>
				<Typography variant="h6" color="textPrimary">
					{title}
				</Typography>
				{subtitle && (
					<Typography variant="body2" color="textSecondary">
						{subtitle}
					</Typography>
				)}
			</div>
		</div>
	);
};

export default PageHeader;
