import React, { HTMLAttributes } from 'react';
import { makeStyles } from '@material-ui/core';
import { VaultDTO } from '@badger-dao/sdk';
import TokenLogo from '../TokenLogo';
import clsx from 'clsx';

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
			// allow each logo file to have the width of up to two times the expected size
			maxWidth: logoWidth * 2,
			zIndex: totalAmountOfLogos - logoPosition,
			// we move the logos to the left except from the first logo
			marginRight: logoPosition === 0 ? 0 : -spacingGap,
		},
	})().position;
}

interface Props extends HTMLAttributes<HTMLDivElement> {
	tokens: VaultDTO['tokens'];
}

const VaultLogo = ({ tokens, className, ...props }: Props): JSX.Element => {
	const classes = useStyles();
	return (
		<div className={clsx(classes.root, className)} {...props}>
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
