import React from 'react';
import { Typography, makeStyles } from '@material-ui/core';
import WalletWidget from './WalletWidget';
import GasWidget from './GasWidget';

export interface PageHeaderProps {
	title: string;
	subtitle?: string;
}

const useStyles = makeStyles((theme) => ({
	headerWidgets: {
		display: 'flex',
		alignItems: 'center',
	},
	headerContainer: {
		display: 'flex',
		marginTop: theme.spacing(3),
		[theme.breakpoints.down('sm')]: {
			marginTop: theme.spacing(12),
		},
		alignItems: 'center',
		justifyContent: 'space-between',
	},
}));

const PageHeader: React.FC<PageHeaderProps> = (props: PageHeaderProps) => {
	const classes = useStyles();
	const { title, subtitle } = props;
	return (
		<div className={classes.headerContainer}>
			<div>
				<Typography variant="h2" color="textPrimary">
					{title}
				</Typography>
				{subtitle && (
					<Typography variant="subtitle1" color="textSecondary">
						{subtitle}
					</Typography>
				)}
			</div>
			<div className={classes.headerWidgets}>
				<GasWidget />
				<WalletWidget />
			</div>
		</div>
	);
};

export default PageHeader;
