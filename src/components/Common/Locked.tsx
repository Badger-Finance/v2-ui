import React, { useContext } from 'react';

import { StoreContext } from '../../mobx/store-context';
import { TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import { useForm } from 'react-hook-form';

const TEXTFIELD_ID = 'amountField';

const useStyles = makeStyles((theme) => ({
	button: {
		marginBottom: theme.spacing(1),
	},
	field: {
		margin: theme.spacing(1),
		float: 'right',
	},
}));
export const Locked = observer(() => {
	const store = useContext(StoreContext);
	const classes = useStyles();
	const { register, handleSubmit } = useForm({ mode: 'all' });

	const {
		wallet: { connectedAddress },
		uiState: { unlockApp },
	} = store;

	const onSubmit = (params: any) => {
		unlockApp(params.password);
	};

	return (
		<>
			<form onSubmit={handleSubmit(onSubmit)}>
				<TextField
					autoComplete="off"
					name="password"
					disabled={!connectedAddress}
					inputRef={register}
					id={TEXTFIELD_ID}
					className={classes.field}
					variant="outlined"
					placeholder="Password"
				/>
			</form>
		</>
	);
});
