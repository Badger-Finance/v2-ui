import { Button, List, ListItem, Paper, Popper, Typography } from '@material-ui/core';
import React, { FC } from 'react';

import { ArrowDropDown } from '@material-ui/icons';
import { TokenModel } from 'mobx/model';
import _ from 'lodash';
import { makeStyles } from '@material-ui/core/styles';

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
		maxWidth: '100vw',
		minWidth: 'auto',
	},
	listItem: {
		textTransform: 'none',
	},
}));

type TokenListProps = {
	tokens: Array<TokenModel>;
	selected: TokenModel;
	onTokenSelect: (event: any) => void;
};

export const Tokens = (props: TokenListProps): any => {
	const classes = useStyles();

	const [anchorEl, setAnchorEl] = React.useState(null);
	const open = Boolean(anchorEl);

	const handleClick = (event: any) => {
		setAnchorEl(anchorEl ? null : event.currentTarget);
	};
	const optionClicked = (option: string) => {
		props.onTokenSelect(option);
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
				<Token token={props.selected} />
			</Button>
			<Popper style={{ zIndex: 100000 }} placement="bottom-end" id={'popper'} open={open} anchorEl={anchorEl}>
				<Paper onMouseLeave={() => setAnchorEl(null)}>
					<List>
						{_.map(props.tokens, (token: any) => (
							<ListItem button onClick={() => optionClicked(token)}>
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

export const Token: FC<{ token: any }> = ({ token }: { token: any }) => (
	<div style={{ alignItems: 'center', display: 'flex', flexWrap: 'nowrap', overflow: 'hidden' }}>
		<img src={token.icon} alt={token.name} style={{ height: '2rem', marginRight: '.2rem', display: 'block' }} />
		<Typography variant="body1" component="div">
			{token.symbol}
		</Typography>
	</div>
);
