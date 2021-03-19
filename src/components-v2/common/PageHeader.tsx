import React from 'react';
import { Typography, makeStyles } from '@material-ui/core';
import WalletWidget from './WalletWidget';
import GasWidget from './GasWidget';
import NetworkWidget from './NetworkWidget';

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
		marginTop: theme.spacing(3),
		[theme.breakpoints.down('sm')]: {
			marginTop: theme.spacing(8),
		},
		[theme.breakpoints.down('xs')]: {
			flexDirection: 'column',
		},
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	headerContent: {
		[theme.breakpoints.down('xs')]: {
			marginBottom: theme.spacing(1),
		},
	},
}));

const PageHeader: React.FC<PageHeaderProps> = (props: PageHeaderProps) => {
	const classes = useStyles();
	const { title, subtitle } = props;
	return (
		<div className={classes.headerContainer}>
			<div className={classes.headerContent}>
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
				<NetworkWidget />
				<GasWidget />
				<WalletWidget />
			</div>
		</div>
	);
};

export default PageHeader;
