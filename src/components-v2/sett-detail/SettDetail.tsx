import React from 'react';
import { Container, makeStyles } from '@material-ui/core';
import { Header } from './Header';
import { MainContent } from './MainContent';
import { observer } from 'mobx-react-lite';
import { Footer } from './Footer';

const useStyles = makeStyles((theme) => ({
	root: {
		paddingTop: theme.spacing(0.5),
		marginTop: theme.spacing(2),
	},
}));

export const SettDetail = observer(
	(): JSX.Element => {
		const classes = useStyles();

		return (
			<Container className={classes.root}>
				<Header />
				<MainContent />
				<Footer />
			</Container>
		);
	},
);
