import React from 'react';
import { observer } from 'mobx-react-lite';
import { Grid, Link } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import BookOutlinedIcon from '@material-ui/icons/BookOutlined';
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
	userGuide: {
		color: theme.palette.text.secondary,
		marginTop: theme.spacing(2),
		width: '100%',
	},
	userGuideIcon: {
		color: theme.palette.primary.main,
	},
	userGuideLink: {
		marginLeft: 3,
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
				<Alert
					className={classes.userGuide}
					severity="info"
					iconMapping={{ info: <BookOutlinedIcon fontSize="inherit" className={classes.userGuideIcon} /> }}
				>
					Not sure where to start? Check out the
					<Link href="#" className={classes.userGuideLink}>
						Boost Optimizer User Guide
					</Link>
				</Alert>
			</Grid>
		</LayoutContainer>
	);
});
