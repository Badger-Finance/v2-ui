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
import BigNumber from 'bignumber.js';
import { isValidAmountChange, sanitizeValue } from './utils';

interface Props {
	referenceBalance: string;
	amount: string;
	selectedOption?: string;
	placeholder: string;
	options: string[];
	disabledAmount?: boolean;
	disabledOptions?: boolean;
	// eslint-disable-next-line autofix/no-unused-vars
	onAmountChange: (amount: string) => void;
	// eslint-disable-next-line autofix/no-unused-vars
	onOptionChange: (option: string) => void;
}

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

export const ClawParams: FC<Props> = ({
	referenceBalance,
	disabledAmount = false,
	disabledOptions = false,
	amount,
	selectedOption,
	placeholder,
	options: _options,
	onAmountChange,
	onOptionChange,
}) => {
	const classes = useStyles();

	const handleOptionChange = (event: React.ChangeEvent<{ value: unknown }>) => {
		onOptionChange(event.target.value as string);
	};

	const handleAmountChange = (event: React.ChangeEvent<{ value: unknown }>) => {
		const input = event.target.value as string;
		const isValidChange = isValidAmountChange(input);

		if (!isValidChange) {
			return;
		}

		onAmountChange(sanitizeValue(event.target.value as string));
	};

	const applyPercentage = (percentage: number) => {
		const newAmount = new BigNumber(referenceBalance).multipliedBy(percentage / 100);

		onAmountChange(newAmount.toString());
	};

	return (
		<Box clone px={1}>
			<Grid container alignContent="center" alignItems="center" className={classes.contentContainer}>
				<Grid item xs={12} sm={8}>
					<Grid container alignItems="center" spacing={2} className={classes.selectContainer}>
						<Grid item xs={12} sm={5} lg={4}>
							<FormControl className={classes.margin}>
								<Select
									autoWidth
									displayEmpty
									value={selectedOption || ''}
									onChange={handleOptionChange}
									disabled={disabledOptions}
									input={<InputBase placeholder="0.00" color="primary" disabled={disabledAmount} />}
								>
									<MenuItem value="" disabled>
										{placeholder}
									</MenuItem>
									{_options.map((option, index) => (
										<MenuItem key={`${option}_${index}`} value={option}>
											{option}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>
						<Grid item xs={12} sm={7} lg={8}>
							<InputBase
								type="tel"
								placeholder="0.00"
								disabled={disabledAmount}
								inputProps={{ pattern: '^[0-9]*[.,]?[0-9]*$' }}
								className={classes.input}
								onChange={handleAmountChange}
								value={amount}
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
										applyPercentage(amount);
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
