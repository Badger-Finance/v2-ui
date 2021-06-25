import React from 'react';
import { observer } from 'mobx-react-lite';
import { Grid, Container, Link } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Calculator } from './Calculator';
import PageHeader from '../../components-v2/common/PageHeader';

const useStyles = makeStyles((theme) => ({
	root: {
		[theme.breakpoints.up('md')]: {
			paddingLeft: theme.spacing(30),
		},
	},
	headerContainer: {
		marginTop: theme.spacing(3),
		marginBottom: theme.spacing(3),
	},
	boostLink: {
		fontWeight: 'bold',
		[theme.breakpoints.down('xs')]: {
			display: 'none',
		},
	},
}));

export const BoostOptimizer = observer(() => {
	const classes = useStyles();

	return (
		<Container className={classes.root}>
			<Grid container spacing={1} justify="center">
				<Grid item xs={12} className={classes.headerContainer}>
					<PageHeader
						title="Badger Boost Optimizer"
						subtitle="Use this tool to determine the amount you need to deposit in order to hit your desired boost ratio."
					/>
					<Link
						target="_blank"
						rel="noopener noreferrer"
						href="https://badger.wiki/badger-boost"
						color="primary"
						className={classes.boostLink}
					>
						How does boosts work?
					</Link>
				</Grid>
				<Grid item xs={12}>
					<Calculator />
				</Grid>
			</Grid>
		</Container>
	);
});
