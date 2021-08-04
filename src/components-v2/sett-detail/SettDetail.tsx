import React from 'react';
import { CircularProgress, Container, makeStyles, Typography } from '@material-ui/core';
import { Header } from './Header';
import { MainContent } from './MainContent';
import { observer } from 'mobx-react-lite';
import { Footer } from './Footer';
import { StoreContext } from '../../mobx/store-context';

const useStyles = makeStyles((theme) => ({
	root: {
		paddingTop: theme.spacing(0.5),
		marginTop: theme.spacing(2),
	},
	notReadyContainer: {
		textAlign: 'center',
		marginTop: theme.spacing(10),
	},
}));

export const SettDetail = observer(
	(): JSX.Element => {
		const {
			settDetail: { sett },
		} = React.useContext(StoreContext);

		const classes = useStyles();

		if (sett === undefined) {
			return (
				<Container className={classes.root}>
					<div className={classes.notReadyContainer}>
						<CircularProgress color="primary" size={60} />
						<Typography>Loading Sett Information</Typography>
					</div>
				</Container>
			);
		}

		if (sett === null) {
			return (
				<Container className={classes.root}>
					<div className={classes.notReadyContainer}>
						{/*TODO: replace with not found logo*/}
						<Typography>Sett Not Found</Typography>
					</div>
				</Container>
			);
		}

		return (
			<Container className={classes.root}>
				<Header />
				<MainContent sett={sett} />
				<Footer />
			</Container>
		);
	},
);
