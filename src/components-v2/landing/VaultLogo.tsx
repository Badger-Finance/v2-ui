import React from 'react';
import { makeStyles } from '@material-ui/core';
import { Vault } from '@badger-dao/sdk';

const logoWidth = 32;
const logoHeight = 32;
const overlapGapPercentage = 0.3; // we want the tokens to be overlapping by 30% of their width

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
			height: logoHeight,
			width: logoWidth,
			zIndex: totalLogos - index,
			// we move the logos to the left except from the first logo
			marginRight: index === 0 ? 0 : -(logoWidth * overlapGapPercentage),
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
					src={`/assets/icons/${token.symbol.toLowerCase()}.svg`}
					className={getLogoStyles(index, totalTokens.length)}
					alt={`${token.symbol} logo`}
				/>
			))}
		</div>
	);
};

export default VaultLogo;
