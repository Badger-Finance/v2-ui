import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { Typography, Button, Popper, Paper, List, ListItem } from '@material-ui/core';
import { ArrowDropDown } from '@material-ui/icons';
import { TokenBalance } from '../../mobx/model/tokens/token-balance';
import { Token } from '@badger-dao/sdk';

const useStyles = makeStyles((theme) => ({
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
		height: '25px',
		width: '25px',
		marginRight: theme.spacing(1),
	},
	tokenLabel: {
		alignSelf: 'center',
		margin: '0px 8px 0px 14px',
	},
	network: {
		marginRight: theme.spacing(1),
		pointerEvents: 'none',
	},
	selectButton: {
		textTransform: 'none',
		maxWidth: '100%',
		minWidth: 'auto',
	},
	listItem: {
		textTransform: 'none',
	},
	tokenContainer: {
		display: 'flex',
		alignItems: 'center',
		padding: theme.spacing(0.5),
	},
}));

type TokenListProps = {
	balances: Array<TokenBalance>;
	selected: TokenBalance;
	onTokenSelect: (token: TokenBalance) => void;
};

export const OptionTokens = ({ balances, selected, onTokenSelect }: TokenListProps): any => {
	const classes = useStyles();

	const [anchorEl, setAnchorEl] = React.useState(null);
	const open = Boolean(anchorEl);

	const handleClick = (event: any) => {
		setAnchorEl(anchorEl ? null : event.currentTarget);
	};

	return (
		<>
			<Button
				size="small"
				variant="outlined"
				endIcon={<ArrowDropDown />}
				onClick={handleClick}
				className={classes.selectButton}
			>
				<OptionToken token={selected.token} />
			</Button>
			<Popper style={{ zIndex: 100000 }} placement="bottom-end" id={'popper'} open={open} anchorEl={anchorEl}>
				<Paper onMouseLeave={() => setAnchorEl(null)}>
					<List>
						{balances.map((balance) => (
							<ListItem
								key={balance.token.address}
								button
								onClick={() => {
									onTokenSelect(balance);
									setAnchorEl(null);
								}}
							>
								<OptionToken token={balance.token} />
							</ListItem>
						))}
					</List>
				</Paper>
			</Popper>
		</>
	);
};

interface TokenProps {
	token: Token;
}

export const OptionToken = ({ token }: TokenProps): JSX.Element => {
	const { name, symbol } = token;
	const classes = useStyles();
	return (
		<div className={classes.tokenContainer}>
			<img className={classes.tokenIcon} src={`/assets/icons/${symbol.toLowerCase()}.png`} alt={name} />
			<Typography variant="body1" component="div">
				{symbol}
			</Typography>
		</div>
	);
};
