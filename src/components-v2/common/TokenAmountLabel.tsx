/* eslint-disable react/prop-types */
import React, { FC } from 'react';
import {
	FormControl,
	Grid,
	InputBase,
	makeStyles,
	MenuItem,
	Select,
	Button,
	ButtonGroup,
	Box,
} from '@material-ui/core';

interface Props {
	displayAmount?: string;
	selectedOption?: string;
	placeholder?: string;
	options?: Map<string, string>;
	disabledAmount?: boolean;
	disabledOptions?: boolean;
	onOptionChange: (option: string) => void;
	onAmountChange: (amount: string) => void;
	onApplyPercentage: (amount: number) => void;
}

const useStyles = makeStyles((theme) => ({
	margin: {
		margin: theme.spacing(1),
	},
	border: {
		border: '1px solid #5C5C5C',
		borderRadius: 8,
	},
	selectContainer: {
		[theme.breakpoints.only('xs')]: {
			justifyContent: 'space-between',
		},
		[theme.breakpoints.up('lg')]: {
			paddingLeft: '10%',
		},
	},
	input: {
		color: theme.palette.text.secondary,
		fontWeight: 'normal',
		[theme.breakpoints.only('xs')]: {
			paddingLeft: theme.spacing(1),
			paddingBottom: theme.spacing(1),
		},
	},
	button: {
		borderRadius: 0,
	},
}));

/**
 * This component can be used to display a selector of a set of tokens, an input for the amount,
 * and a group of buttons to represent percentage of the asset.
 *
 * Each token needs to have the following structure: [tokenAddress: string] => [tokenName: string]
 *
 */
export const TokenAmountSelector: FC<Props> = ({
	selectedOption = '',
	displayAmount = '',
	placeholder = '0.00',
	disabledAmount = false,
	disabledOptions = false,
	options: _options = new Map<string, string>(),
	onAmountChange,
	onOptionChange,
	onApplyPercentage,
}) => {
	const classes = useStyles();

	const handleOptionChange = (event: React.ChangeEvent<{ value: unknown }>) => {
		onOptionChange(event.target.value as string);
	};

	const handleAmountChange = (event: React.ChangeEvent<{ value: unknown }>) => {
		const input = event.target.value as string;
		if (!isValidAmountChange(input)) return;
		onAmountChange(sanitizeValue(input));
	};

	return (
		<Box clone px={1}>
			<Grid container alignContent="center" alignItems="center" className={classes.border}>
				<Grid item xs={12} sm={8}>
					<Grid container alignItems="center" spacing={2} className={classes.selectContainer}>
						<Grid item xs={12} sm>
							<FormControl className={classes.margin}>
								<Select
									autoWidth
									displayEmpty
									value={selectedOption}
									onChange={handleOptionChange}
									disabled={disabledOptions}
									input={<InputBase placeholder="0.00" color="primary" disabled={disabledAmount} />}
								>
									<MenuItem value="" disabled>
										{placeholder}
									</MenuItem>
									{Array.from(_options).map(([key, value]) => (
										<MenuItem key={`${key}_${value}`} value={key}>
											{value}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>
						<Grid item xs={12} sm>
							<InputBase
								type="tel"
								error
								placeholder="0.00"
								disabled={disabledAmount}
								inputProps={{ pattern: '^[0-9]*[.,]?[0-9]*$' }}
								className={classes.input}
								onChange={handleAmountChange}
								value={displayAmount}
							/>
						</Grid>
					</Grid>
				</Grid>
				<Grid item xs={12} sm={4}>
					<Grid container justify="flex-end">
						<ButtonGroup
							variant="text"
							size="small"
							aria-label="text button group"
							disabled={disabledAmount}
						>
							{[25, 50, 75, 100].map((amount: number, index: number) => (
								<Button
									key={`button_${amount}_${index}`}
									disableElevation
									variant="text"
									className={classes.button}
									onClick={() => {
										onApplyPercentage(amount);
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

function isValidAmountChange(input: string) {
	const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`);
	const cleanInput = input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	return inputRegex.test(cleanInput);
}

function sanitizeValue(value: string): string {
	const isNonCalculableValue = ['', '.'].includes(value) || +value < 0;
	return isNonCalculableValue ? '' : value;
}

export default TokenAmountSelector;
