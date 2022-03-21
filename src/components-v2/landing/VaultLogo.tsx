import React from 'react';
import { makeStyles } from '@material-ui/core';
import { Vault } from '@badger-dao/sdk';
import { getTokenIconPath } from '../../utils/componentHelpers';

const logoWidth = 32;
const overlapGapPercentage = 0.3; // we want the tokens to be overlapping by 30% of their width
const spacingGap = logoWidth * overlapGapPercentage;

const useStyles = makeStyles({
	root: {
		display: 'flex',
		alignItems: 'center',
		flexDirection: 'row-reverse',
	},
});

function getLogoStyles(index: number, totalLogos: number) {
	return makeStyles({
		position: {
			// allow each logo file to have the width of up to three times the expected size
			maxWidth: logoWidth * 2,
			zIndex: totalLogos - index,
			// we move the logos to the left except from the first logo
			marginRight: index === 0 ? 0 : -spacingGap,
		},
	})().position;
}

interface Props {
	tokens: Vault['tokens'];
}

const VaultLogo = ({ tokens }: Props): JSX.Element => {
	const classes = useStyles();
	return (
		<div className={classes.root}>
			{tokens.map((token, index, totalTokens) => (
				<img
					key={`${token.symbol}_${index}`}
					src={getTokenIconPath(token)}
					className={getLogoStyles(index, totalTokens.length)}
					alt={`${token.symbol} logo`}
				/>
			))}
		</div>
	);
};

export default VaultLogo;
