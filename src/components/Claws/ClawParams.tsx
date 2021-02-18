/* eslint-disable react/prop-types */
import React, { FC, useState } from 'react';
import {
	FormControl,
	Grid,
	InputBase,
	makeStyles,
	MenuItem,
	Select,
	Typography,
	Button,
	ButtonGroup,
	Box,
} from '@material-ui/core';
import BigNumber from 'bignumber.js';
import _keyBy from 'lodash/keyBy';

type Token = {
	name: string;
	balance: string;
};

type Props = {
	tokens: Token[];
};

const useStyles = makeStyles((theme) => ({
	margin: {
		margin: theme.spacing(1),
	},
	contentContainer: {
		border: '1px solid #5C5C5C',
		borderRadius: 8,
	},
	selectContainer: {
		[theme.breakpoints.only('xs')]: {
			justifyContent: 'space-between',
		},
		[theme.breakpoints.up('sm')]: {
			paddingLeft: '15%',
		},
	},
	whiteBold: {
		color: theme.palette.common.white,
		fontWeight: 'bold',
	},
}));

export const ClawParams: FC<Props> = ({ tokens: _tokens }) => {
	const classes = useStyles();
	const tokens = _keyBy(_tokens, 'name');
	const [token, setToken] = useState<Token | undefined>();
	const [percentage, setPercentage] = useState<number | undefined>(undefined);

	const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
		setToken(tokens[event.target.value as string]);
	};

	const displayValue = new BigNumber(token?.balance || 0).multipliedBy((percentage || 100) / 100);

	return (
		<Box clone px={2}>
			<Grid
				container
				justify="space-between"
				alignContent="center"
				alignItems="center"
				className={classes.contentContainer}
			>
				<Grid item xs={12} sm={6}>
					<Grid container alignItems="center" spacing={2} className={classes.selectContainer}>
						<Grid item>
							<FormControl className={classes.margin}>
								<Select
									autoWidth
									displayEmpty
									placeholder="Select a Token"
									value={token?.name || ''}
									onChange={handleChange}
									input={<InputBase className={classes.whiteBold} />}
								>
									<MenuItem value="" disabled>
										<em>Select a Token</em>
									</MenuItem>
									{_tokens.map((token, index) => (
										<MenuItem key={`${token}_${index}`} value={token.name}>
											{token.name}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>
						<Grid item>
							<Typography variant="body2" color="textSecondary">
								{displayValue.toPrecision(3).toString()}
							</Typography>
						</Grid>
					</Grid>
				</Grid>
				<Grid item xs={12} sm={6}>
					<Grid container justify="flex-end">
						<ButtonGroup
							size="small"
							variant="text"
							className={classes.whiteBold}
							aria-label="text primary button group"
						>
							{[25, 50, 75, 100].map((amount: number, index: number) => (
								<Button
									key={`button_${amount}_${index}`}
									variant="text"
									className={classes.whiteBold}
									onClick={() => {
										setPercentage(amount);
									}}
								>
									{amount}%
								</Button>
							))}
						</ButtonGroup>
					</Grid>
				</Grid>
			</Grid>
		</Box>
	);
};

export default ClawParams;
