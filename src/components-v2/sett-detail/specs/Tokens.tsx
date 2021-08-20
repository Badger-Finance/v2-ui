import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import { StyledDivider } from '../styled';
import { Sett } from '../../../mobx/model/setts/sett';
import { SettToken } from './SettToken';

interface Props {
	sett: Sett;
}

export const Tokens = ({ sett }: Props): JSX.Element => {
	return (
		<Grid container>
			<Typography>Tokens</Typography>
			<StyledDivider />
			<Grid container>
				{sett.tokens.map((token, index) => (
					<SettToken key={`${sett.name}-${token.name}-${index}`} token={token} />
				))}
			</Grid>
		</Grid>
	);
};
