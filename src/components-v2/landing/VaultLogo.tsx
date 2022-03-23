import React from 'react';
import { makeStyles } from '@material-ui/core';
import { VaultDTO } from '@badger-dao/sdk';
import TokenLogo from '../TokenLogo';

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

function getLogoStyles(logoPosition: number, totalAmountOfLogos: number) {
	return makeStyles({
		position: {
			// allow each logo file to have the width of up to three times the expected size
			maxWidth: logoWidth * 2,
			zIndex: totalAmountOfLogos - logoPosition,
			// we move the logos to the left except from the first logo
			marginRight: logoPosition === 0 ? 0 : -spacingGap,
		},
	})().position;
}

interface Props {
	tokens: VaultDTO['tokens'];
}

const VaultLogo = ({ tokens }: Props): JSX.Element => {
	const classes = useStyles();
	return (
		<div className={classes.root}>
			{tokens.map((token, index, totalTokens) => (
				<TokenLogo
					token={token}
					key={`${token.symbol}_${index}`}
					className={getLogoStyles(index, totalTokens.length)}
				/>
			))}
		</div>
	);
};

export default VaultLogo;
