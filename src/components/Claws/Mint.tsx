import React, { useState } from 'react';
import {
	createStyles,
	FormControl,
	Grid,
	InputBase,
	makeStyles,
	MenuItem,
	Select,
	withStyles,
	Typography,
	Button,
	ButtonGroup,
} from '@material-ui/core';
import watch from 'material-ui/svg-icons/hardware/watch';

const useStyles = makeStyles((theme) => ({
	margin: {
		margin: theme.spacing(1),
	},
}));

const BorderlessInput = withStyles((theme) =>
	createStyles({
		root: {
			'label + &': {
				marginTop: theme.spacing(4),
			},
		},
		input: {
			borderRadius: 4,
			fontSize: 16,
			fontWeight: 'bold',
		},
	}),
)(InputBase);

export const Mint = () => {
	const classes = useStyles();
	const [collateral, setCollateral] = useState('wbtcWethSLP');

	const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
		setCollateral(event.target.value as string);
	};

	return (
		<Grid container>
			<Grid item>
				<FormControl className={classes.margin}>
					<Select value={collateral} onChange={handleChange} input={<BorderlessInput />}>
						<MenuItem value="wbtcWethSLP">wbtcWethSLP</MenuItem>
						<MenuItem value="wbtcWethSLP2">wbtcWethSLP2</MenuItem>
						<MenuItem value="wbtcWethSLP3">wbtcWethSL3</MenuItem>
					</Select>
				</FormControl>
			</Grid>
			<Grid item>
				<Typography variant="subtitle1" color="textSecondary">
					0.00
				</Typography>
			</Grid>
			<Grid item>
				<ButtonGroup size="small" aria-label="small outlined button group">
					{[25, 50, 75, 100].map((amount: number, index: number) => (
						<Button key={`button_${amount}_${index}`} variant="outlined" style={{ color: 'white' }}>
							{amount}%
						</Button>
					))}
				</ButtonGroup>
			</Grid>
		</Grid>
	);
};
