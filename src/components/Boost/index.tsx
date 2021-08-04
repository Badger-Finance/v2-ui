import React from 'react';
import { observer } from 'mobx-react-lite';
import { Grid, Link } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Optimizer } from './Optimizer';
import PageHeader from '../../components-v2/common/PageHeader';
import { HeaderContainer, LayoutContainer } from '../../components-v2/common/Containers';

const useStyles = makeStyles((theme) => ({
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
		<LayoutContainer>
			<Grid container spacing={1} justify="center">
				<HeaderContainer item xs={12}>
					<PageHeader
						title="Badger Boost Optimizer"
						subtitle="Determine deposits needed in order to hit your desired boost ratio."
					/>
					<Link
						target="_blank"
						rel="noopener noreferrer"
						href="https://badger.wiki/badger-boost"
						color="primary"
						className={classes.boostLink}
					>
						How does boost work?
					</Link>
				</HeaderContainer>
				<Grid item xs={12}>
					<Optimizer />
				</Grid>
			</Grid>
		</LayoutContainer>
	);
});
