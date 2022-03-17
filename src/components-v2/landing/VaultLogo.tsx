import React from 'react';
import { makeStyles } from '@material-ui/core';
import { Vault } from '@badger-dao/sdk';

const logoWidth = 32;
const logoHeight = 32;
const overlapGapPercentage = 0.3; // we want the tokens to be overlapping by 30% of their width

const useStyles = (numOfTokens: number) => {
	const maxWidth = logoWidth * numOfTokens; // total space the logos would take up
	const complementaryTokensWidth = (numOfTokens - 1) * logoWidth; // logos space minus the first logo
	const overlapGaps = complementaryTokensWidth * overlapGapPercentage; // the total space of the overlapping gaps
	return makeStyles({
		root: {
			// because we're overlapping each logo a bit we don't really use all the space they would take up if they were
			// next to each other. We remove these overlapping gaps from the total amount.
			width: maxWidth - overlapGaps,
			height: logoHeight,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'flex-end',
			position: 'relative',
		},
	})();
};

function getLogoStyles(index: number, totalLogos: number) {
	return makeStyles({
		position: {
			position: 'absolute',
			height: logoHeight,
			width: logoWidth,
			zIndex: totalLogos - index,
			// we move the logos 70% of their size to the left and increase by position
			right: index * (logoWidth * (1 - overlapGapPercentage)),
		},
	})().position;
}

interface Props {
	tokens: Vault['tokens'];
}

const VaultLogo = ({ tokens }: Props): JSX.Element => {
	const classes = useStyles(tokens.length);
	return (
		<div className={classes.root}>
			{tokens.reverse().map((token, index, totalTokens) => (
				<img
					key={`${token.symbol}_${index}`}
					src={`/assets/icons/${token.symbol.toLowerCase()}.svg`}
					className={getLogoStyles(index, totalTokens.length)}
					alt={`${token.symbol} logo`}
				/>
			))}
		</div>
	);
};

export default VaultLogo;
