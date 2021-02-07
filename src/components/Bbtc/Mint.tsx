import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { Container, Button } from '@material-ui/core';

import { Tokens } from './Tokens';

const useStyles = makeStyles(() => ({
	root: {
		padding: '40px 24px 32px 24px',
	},
	outerWrapper: {
		display: 'flex',
		flexDirection: 'column',
	},
	balance: {
		textAlign: 'right',
		marginBottom: '16px',
	},
	inputWrapper: {
		display: 'flex',
		border: '1px solid #6B6B6B',
		borderRadius: '9px',
		padding: '18px 20px',
		minHeight: '82px',
	},
	btnMax: {
		alignSelf: 'center',
		marginLeft: 'auto',
		fontSize: '12px',
		lineHeight: '16px',
	},
	noUnderline: {
		'&:after': {
			opacity: 0,
		},
		'&::before': {
			opacity: 0,
		},
	},
	token: {
		display: 'flex',
	},
	tokenIcon: {
		height: '30px',
		width: '30px',
		alignSelf: 'center',
	},
	tokenLabel: {
		alignSelf: 'center',
		marginRight: '14px',
		marginLeft: '14px',
	},
	unstylishInput: {
		color: 'white',
		fontSize: '18px',
		lineHeight: '20px',
		margin: '0px 32px',
		width: '100%',
	},
}));

export const Mint = (): any => {
	const classes = useStyles();

	const [selectedToken, setTokenSelected] = useState<string>('digg');
	const handleTokenSelection = (event: any) => {
		setTokenSelected(event?.target?.value);
	};

	return (
		<Container className={classes.root} maxWidth="lg">
			<div className={classes.outerWrapper}>
				<div className={classes.balance}>Available wBTC: 0.59</div>
				<div className={classes.inputWrapper}>
					<Tokens tokens={['digg']} default={selectedToken} onTokenSelect={handleTokenSelection} />
					<input className={classes.unstylishInput + ' unstylish-input'} type="text" placeholder="0.0" />

					<Button className={classes.btnMax} variant="outlined">
						max
					</Button>
				</div>
			</div>
		</Container>
	);
};
