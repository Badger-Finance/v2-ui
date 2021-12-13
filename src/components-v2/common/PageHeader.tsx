import React from 'react';
import { Typography, makeStyles } from '@material-ui/core';

export interface PageHeaderProps {
	title: string;
	subtitle?: string | React.ReactNode;
}

const useStyles = makeStyles(() => ({
	headerContainer: {
		display: 'flex',
		flexDirection: 'column',
	},
}));

const PageHeader: React.FC<PageHeaderProps> = (props: PageHeaderProps) => {
	const classes = useStyles();
	const { title, subtitle } = props;
	return (
		<div className={classes.headerContainer}>
			<Typography variant="h6" color="textPrimary">
				{title}
			</Typography>
			{subtitle &&
				(typeof subtitle === 'string' ? (
					<Typography variant="body2" color="textSecondary">
						{subtitle}
					</Typography>
				) : (
					subtitle
				))}
		</div>
	);
};

export default PageHeader;
