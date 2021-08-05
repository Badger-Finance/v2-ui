import React from 'react';
import { Container, makeStyles, Typography } from '@material-ui/core';
import { Header } from './Header';
import { MainContent } from './MainContent';
import { observer } from 'mobx-react-lite';
import { Footer } from './Footer';
import { StoreContext } from '../../mobx/store-context';
import { MobileStickyActionButtons } from './MobileStickyActionButtons';
import { Loader } from '../../components/Loader';

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
			wallet: { connectedAddress },
			settDetail: { sett, isLoading, isNotFound },
		} = React.useContext(StoreContext);

		const classes = useStyles();

		if (isLoading) {
			return (
				<Container className={classes.root}>
					<div className={classes.notReadyContainer}>
						<Loader message="Loading Sett Information" />
					</div>
				</Container>
			);
		}

		if (isNotFound) {
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
			<>
				<Container className={classes.root}>
					<Header />
					{sett && <MainContent sett={sett} />}
					<Footer />
				</Container>
				{connectedAddress && <MobileStickyActionButtons />}
			</>
		);
	},
);
