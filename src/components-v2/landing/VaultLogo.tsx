import React, { HTMLAttributes } from 'react';
import { makeStyles } from '@material-ui/core';
import { VaultDTO } from '@badger-dao/sdk';
import clsx from 'clsx';
import ComposableTokenLogo from '../ComposableTokenLogo/ComposableTokenLogo';

const useStyles = makeStyles({
	root: {
		display: 'flex',
		alignItems: 'center',
		flexDirection: 'row-reverse',
	},
});

interface Props extends HTMLAttributes<HTMLDivElement> {
	tokens: VaultDTO['tokens'];
}

const VaultLogo = ({ tokens, className, ...props }: Props): JSX.Element => {
	const classes = useStyles();
	return (
		<div className={clsx(classes.root, className)} {...props}>
			{tokens.map((token, index, totalTokens) => (
				<ComposableTokenLogo
					token={token}
					logoPosition={index}
					totalLogos={totalTokens.length}
					key={`${token.symbol}_${index}`}
				/>
			))}
		</div>
	);
};

export default VaultLogo;
