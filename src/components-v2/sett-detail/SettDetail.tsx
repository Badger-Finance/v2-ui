import React from 'react';
import { Container, makeStyles } from '@material-ui/core';
import { Header } from './Header';
import { Content } from './Content';
import { observer } from 'mobx-react-lite';

const useStyles = makeStyles((theme) => ({
	root: {
		[theme.breakpoints.up('md')]: {
			paddingLeft: 115,
			paddingTop: theme.spacing(3),
		},
	},
}));

export const SettDetail = observer(
	(): JSX.Element => {
		const classes = useStyles();

		return (
			<Container className={classes.root} maxWidth="lg">
				<Header />
				<Content />
			</Container>
		);
	},
);
