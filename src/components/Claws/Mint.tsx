import React, { FC } from 'react';
import { Container, Grid, Box } from '@material-ui/core';
import ClawParams from './ClawParams';

export const Mint: FC = () => {
	return (
		<Box clone px={3}>
			<Container>
				<ClawParams
					tokens={[
						{ name: 'wbtcWethSLP', balance: '100' },
						{ name: 'wbtcWethSLP2', balance: '200' },
						{ name: 'wbtcWethSLP3', balance: '300' },
					]}
				/>
			</Container>
		</Box>
	);
};
