import React from 'react';
import {
	Button,
	Grid,
	OutlinedInput,
	Tooltip,
	Typography,
	useMediaQuery,
	useTheme,
	withStyles,
} from '@material-ui/core';
import InfoIcon from '@material-ui/icons/Info';
import { makeStyles, styled } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';

import { getColorFromComparison } from './utils';
import { useNumericInput } from '../../utils/useNumericInput';
import { isValidMultiplier, rankAndLevelFromStakeRatio } from '../../utils/boost-ranks';
import { StoreContext } from '../../mobx/store-context';
import { MIN_BOOST_LEVEL } from '../../config/system/boost-ranks';

const StyledInfoIcon = styled(InfoIcon)(({ theme }) => ({
	marginLeft: theme.spacing(1),
	color: 'rgba(255, 255, 255, 0.3)',
}));

const BoostInput = withStyles(() => ({
	root: {
		marginLeft: 12,
		maxWidth: 70,
	},
	input: {
		fontSize: 21,
		padding: 8,
		textAlign: 'center',
	},
	notchedOutline: {
		borderWidth: 2,
	},
}))(OutlinedInput);

const useMultiplierStyles = (currentMultiplier?: string, accountMultiplier = 0) => {
	return makeStyles((theme) => {
		if (!currentMultiplier) {
			return {
				fontColor: {
					color: theme.palette.text.secondary,
				},
			};
		}

		return {
			fontColor: {
				color: getColorFromComparison({
					toCompareValue: currentMultiplier,
					toBeComparedValue: accountMultiplier,
					greaterCaseColor: '#74D189',
					lessCaseColor: theme.palette.error.main,
					defaultColor: theme.palette.text.secondary,
				}),
			},
		};
	});
};

const useStyles = makeStyles((theme) => ({
	header: {
		justifyContent: 'space-between',
		[theme.breakpoints.down(480)]: {
			justifyContent: 'center',
		},
	},
	boostText: {
		fontSize: theme.spacing(4),
	},
	invalidMultiplier: {
		color: theme.palette.error.main,
	},
	boostSectionContainer: {
		display: 'flex',
		alignItems: 'center',
	},
}));

interface Props {
	multiplier?: string;
	accountMultiplier?: number;
	disableBoost?: boolean;
	onBoostChange: (change: string) => void;
	onReset: () => void;
	onLockedBoostClick: () => void;
}

export const OptimizerHeader = observer(
	({ multiplier, disableBoost = false, onBoostChange, onReset, onLockedBoostClick }: Props): JSX.Element => {
		const {
			user: { accountDetails },
			wallet: { connectedAddress },
		} = React.useContext(StoreContext);

		const { onValidChange, inputProps } = useNumericInput();
		const classes = useStyles();
		const theme = useTheme();
		const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

		const isLoading = !!connectedAddress && accountDetails === undefined;
		const isLocked = isLoading || disableBoost;

		const stakeRatioToCompare = accountDetails?.stakeRatio || MIN_BOOST_LEVEL.stakeRatioBoundary;
		const { 1: accountLevel } = rankAndLevelFromStakeRatio(stakeRatioToCompare);

		const boostClasses = useMultiplierStyles(multiplier, accountLevel.multiplier)();

		let validBoost = false;

		// evaluate only after loaded
		if (multiplier !== undefined) {
			validBoost = isValidMultiplier(Number(multiplier));
		}

		return (
			<Grid container spacing={isMobile ? 2 : 0} className={classes.header} alignItems="center">
				<Grid item className={classes.boostSectionContainer}>
					<Typography display="inline" className={classes.boostText}>
						Boost:
					</Typography>
					<BoostInput
						className={validBoost ? boostClasses.fontColor : classes.invalidMultiplier}
						disabled={isLocked}
						error={!validBoost}
						inputProps={{ ...inputProps, 'aria-label': 'boost multiplier number' }}
						placeholder="1.00"
						onChange={onValidChange(onBoostChange)}
						value={multiplier || ''}
						onClick={() => {
							if (isLocked) {
								onLockedBoostClick();
							}
						}}
					/>
					<Tooltip
						title={
							'This is a boost estimation at a point in time for the purpose of illustration only. This is a means to help you optimize your returns. Please refer to the Sett page for your specific returns.'
						}
						arrow
						placement="bottom"
						color="primary"
					>
						<StyledInfoIcon />
					</Tooltip>
				</Grid>
				<Grid item>
					<Button color="primary" variant="outlined" size="small" onClick={onReset}>
						Reset Calculations
					</Button>
				</Grid>
			</Grid>
		);
	},
);
