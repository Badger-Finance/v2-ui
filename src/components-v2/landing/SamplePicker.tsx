import { MenuItem, Select, Tooltip, makeStyles } from '@material-ui/core';
import React, { useContext } from 'react';

import { StoreContext } from '../../mobx/store-context';
import { observer } from 'mobx-react-lite';

const useStyles = makeStyles(() => ({
	samplePicker: {
		height: '1.8rem',
		overflow: 'hidden',
	},
}));

const SamplePicker = observer(() => {
	const classes = useStyles();
	const store = useContext(StoreContext);

	const {
		uiState: { period, setPeriod },
	} = store;

	return (
		<Tooltip
			enterDelay={0}
			leaveDelay={300}
			arrow
			placement="left"
			title="ROI combines the appreciation of the vault with its $BADGER or $DIGG emissions. All numbers are an approximation based on historical data."
		>
			<Select
				variant="outlined"
				value={period}
				onChange={(v: any) => setPeriod(v.target.value)}
				className={classes.samplePicker}
				style={{ marginTop: 'auto', marginBottom: 'auto' }}
			>
				<MenuItem value={'month'}>MONTH</MenuItem>
				<MenuItem value={'year'}>YEAR</MenuItem>
			</Select>
		</Tooltip>
	);
});

export default SamplePicker;
