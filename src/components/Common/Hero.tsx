import { Typography, Paper, makeStyles, ListItem, List, ListItemSecondaryAction } from '@material-ui/core';
import { Wallet } from 'components/Sidebar/Wallet';
import { observer } from 'mobx-react-lite';
import React from 'react';

const useStyles = makeStyles((theme) => ({
	statPaper: {
		[theme.breakpoints.up('sm')]: {
			padding: theme.spacing(2),
		},
		textAlign: 'center',
		minHeight: '100%',
		display: 'flex',
		flexDirection: 'column',
	},
	submetricContainer: {
		paddingBottom: theme.spacing(),
	},
	down: {
		color: theme.palette.error.main,
	},
	up: {
		color: theme.palette.success.main,
	},
	heroPaper: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: theme.spacing(5, 0),
		minHeight: '100%',
		background: 'none',
		textAlign: 'left',
		flexWrap: 'wrap',
	},
	copy: {
		marginBottom: '1rem',

		[theme.breakpoints.up('md')]: {
			marginBottom: '0',
		},
	},
	wallet: {
		[theme.breakpoints.up('md')]: {
			position: 'absolute',
			marginBottom: '0',
			top: theme.spacing(3),
			right: theme.spacing(3),
		},
	},
}));

const Hero = observer((props: any) => {
	const classes = useStyles();

	const { title, subtitle } = props;

	return (
		<div className={classes.heroPaper}>
			<div className={classes.copy}>
				<Typography variant="h2" color="textPrimary">
					{title}
				</Typography>
				<Typography variant="subtitle1" color="textPrimary">
					{subtitle}
				</Typography>
			</div>
			<div className={classes.wallet}>
				<Wallet />
			</div>
		</div>
	);
});

export default Hero;
