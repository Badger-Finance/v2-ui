import React from 'react';
import { Link, makeStyles, Typography } from '@material-ui/core';

const useStyles = makeStyles(() => ({
	link: {
		fontSize: 14,
		fontWeight: 700,
		color: '#91CDFF',
	},
	linkText: {
		marginRight: 6,
	},
}));

interface Props {
	name: string;
	link: string;
}

const WalletLiquidityPoolLink = ({ name, link }: Props): JSX.Element => {
	const classes = useStyles();
	return (
		<Link className={classes.link} href={link} target="_blank" rel="noopener noreferrer">
			<Typography variant="inherit" className={classes.linkText}>
				{name}
			</Typography>
			<img src="/assets/icons/link-icon.svg" alt={`${name} link`} />
		</Link>
	);
};

export default WalletLiquidityPoolLink;
