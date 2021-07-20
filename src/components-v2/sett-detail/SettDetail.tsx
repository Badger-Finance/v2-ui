import React from 'react';
import { Container, makeStyles } from '@material-ui/core';
import { Header } from './Header';
import { Content } from './Content';
import { observer } from 'mobx-react-lite';

const useStyles = makeStyles((theme) => ({
	root: {
		[theme.breakpoints.only('md')]: {
			paddingLeft: 300,
			paddingTop: theme.spacing(3),
		},
		[theme.breakpoints.up('lg')]: {
			paddingLeft: 115,
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
