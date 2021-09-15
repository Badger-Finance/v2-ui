import { Link, makeStyles } from '@material-ui/core';
import React from 'react';
import GenericVaultAdvisory from './GenericVaulAdvisory';

const useStyles = makeStyles(() => ({
	linkContainer: {
		display: 'flex',
		justifyContent: 'center',
		fontSize: '0.95rem',
	},
}));

interface Props {
	accept: () => void;
}

const LockingVaultAdvisory = ({ accept }: Props): JSX.Element => {
	const classes = useStyles();
	return (
		<GenericVaultAdvisory accept={accept}>
			<p>This vault locks Convex in a staking contract that is 16 weeks long.</p>
			<p>
				The Total Withdrawable Amount in the vault may be lower than your balance depending on what is currently
				available and will fluctuate with deposits and withdraws from the vault as well as locks and unlocks
				from the contract.
			</p>
			<p>
				Any vault withdraws will have an opportunity to utilize the freshly deposited liquidity before it gets
				locked on a first-come-first-serve basis.
			</p>
			<div className={classes.linkContainer}>
				<Link
					target="_blank"
					rel="noreferrer"
					href="https://screeching-panther-db4.notion.site/blCVX-Locked-Convex-4eabc8a3ef6b4df39d66cc98d2c1c7fc"
				>
					Learn More
				</Link>
			</div>
		</GenericVaultAdvisory>
	);
};

export default LockingVaultAdvisory;
