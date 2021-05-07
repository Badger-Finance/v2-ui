import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { Typography, Button, Popper, Paper, List, ListItem } from '@material-ui/core';
import { TokenModel } from 'mobx/model';
import { ArrowDropDown } from '@material-ui/icons';

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
		height: '30px',
		width: '30px',
		alignSelf: 'center',
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
}));

type TokenListProps = {
	tokens: Array<TokenModel>;
	selected: TokenModel;
	onTokenSelect: (token: TokenModel) => void;
};

export const Tokens = ({ tokens, selected, onTokenSelect }: TokenListProps): any => {
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
				<Token token={selected} />
			</Button>
			<Popper style={{ zIndex: 100000 }} placement="bottom-end" id={'popper'} open={open} anchorEl={anchorEl}>
				<Paper onMouseLeave={() => setAnchorEl(null)}>
					<List>
						{tokens.map((token) => (
							<ListItem
								key={token.address}
								button
								onClick={() => {
									onTokenSelect(token);
									setAnchorEl(null);
								}}
							>
								{' '}
								<Token token={token} />
							</ListItem>
						))}
					</List>
				</Paper>
			</Popper>
		</>
	);
};

export const Token = (props: { token: any }): JSX.Element => {
	return (
		<div style={{ alignItems: 'center', display: 'flex', flexWrap: 'nowrap', overflow: 'hidden' }}>
			<img
				src={props.token.icon.default}
				alt={props.token.name}
				style={{ height: '2rem', marginRight: '.2rem', display: 'block' }}
			/>
			<Typography variant="body1" component="div">
				{props.token.symbol}
			</Typography>
		</div>
	);
};
