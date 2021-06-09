/* eslint-disable react/prop-types */
import React from 'react';
import { Box, Grid, InputAdornment, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { BoostBadgerAnimation } from './BoostBadgerAnimation';
import { BoostSlider } from './BoostSlider';
import { useNumericInput } from '../../utils/useNumericInput';
import { AssetInput } from './Common';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';

const useStyles = makeStyles((theme) => ({
	content: {
		marginTop: theme.spacing(2),
		marginBottom: theme.spacing(3),
		[theme.breakpoints.down('sm')]: {
			marginBottom: 0,
		},
	},
	boostSlider: {
		padding: '0 22px !important',
		height: 'auto !important',
	},
	settInformation: {
		textAlign: 'center',
	},
}));

type BoostCalculatorContainerProps = {
	native: string;
	nonNative: string;
	onNativeChange(value: string): void;
	onNonNativeChange(value: string): void;
};

export const BoostCalculatorContainer = observer(
	(props: BoostCalculatorContainerProps): JSX.Element => {
		const {
			boostOptimizer: { nativeHoldings, nonNativeHoldings },
		} = React.useContext(StoreContext);

		const { native, nonNative, onNonNativeChange, onNativeChange } = props;
		const classes = useStyles();
		const { onValidChange, inputProps } = useNumericInput();
		const theme = useTheme();
		const smallScreen = useMediaQuery(theme.breakpoints.down(706));

		const handleNativeSliderChange = (event: Event, slideValue: number) => onNativeChange(String(slideValue));
		const handleNonNativeSliderChange = (event: Event, slideValue: number) => onNonNativeChange(String(slideValue));

		const badgerSliders = (
			<Box display="flex" flexDirection="row" alignItems="stretch" justifyContent="center">
				<BoostSlider
					disabled={!nativeHoldings || !nonNativeHoldings}
					className={classes.boostSlider}
					value={Number(0)}
					onChange={handleNativeSliderChange as any}
				/>
				<BoostBadgerAnimation value={Number(0)} />
				<BoostSlider
					disabled={!nativeHoldings || !nonNativeHoldings}
					className={classes.boostSlider}
					value={Number(0)}
					onChange={handleNonNativeSliderChange as any}
				/>
			</Box>
		);

		const nativeBox = (
			<Grid item className={classes.settInformation}>
				<Typography variant="h6">Native: </Typography>
				<AssetInput
					disabled={!nativeHoldings}
					value={native}
					placeholder="10,000"
					inputProps={inputProps}
					startAdornment={<InputAdornment position="start">$</InputAdornment>}
					onChange={onValidChange(onNativeChange)}
				/>
			</Grid>
		);

		const nonNativeBox = (
			<Grid item className={classes.settInformation}>
				<Typography variant="h6">Non Native: </Typography>
				<AssetInput
					disabled={!nonNativeHoldings}
					value={nonNative}
					placeholder="5,000"
					inputProps={inputProps}
					startAdornment={<InputAdornment position="start">$</InputAdornment>}
					onChange={onValidChange(onNonNativeChange)}
				/>
			</Grid>
		);

		if (smallScreen) {
			return (
				<Grid container spacing={4} className={classes.content} alignItems="center" justify="center">
					<Grid item xs={12}>
						{badgerSliders}
					</Grid>
					<Grid item xs={6}>
						{nativeBox}
					</Grid>
					<Grid item xs={6}>
						{nonNativeBox}
					</Grid>
				</Grid>
			);
		}

		return (
			<Grid container className={classes.content} alignItems="center" justify="center">
				<Grid item xs>
					{nativeBox}
				</Grid>
				<Grid item xs={7}>
					{badgerSliders}
				</Grid>
				<Grid item xs>
					{nonNativeBox}
				</Grid>
			</Grid>
		);
	},
);
