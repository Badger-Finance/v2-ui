import { makeStyles, Grid, Link } from '@material-ui/core';
import LinkIcon from '@material-ui/icons/Link';
import React from 'react';

const useStyles = makeStyles((theme) => ({
	linkContainer: {
		marginBottom: theme.spacing(0.5),
	},
	link: {
		fontSize: 12,
		marginLeft: theme.spacing(0.5),
	},
	icon: {
		fontSize: 16,
	},
}));

interface Props {
	title: string;
	href: string;
}

const SettDetailLink = ({ title, href }: Props): JSX.Element => {
	const classes = useStyles();
	return (
		<Grid container alignItems="center" className={classes.linkContainer}>
			<LinkIcon color="primary" className={classes.icon} />
			<Link className={classes.link} target="_blank" rel="noreferrer" href={href}>
				{title}
			</Link>
		</Grid>
	);
};

export default SettDetailLink;
