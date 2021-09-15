import { Checkbox, FormControlLabel, makeStyles } from '@material-ui/core';
import React, { useState } from 'react';
import { ActionButton } from './styled';

const useStyles = makeStyles((theme) => ({
	vaultAdvisoryContainer: {
		display: 'flex',
		flexDirection: 'column',
		paddingLeft: theme.spacing(2),
		paddingRight: theme.spacing(2),
		paddingBottom: theme.spacing(2),
		fontSize: '1.1rem',
		borderTop: '1px solid gray',
		alignItems: 'center',
	},
	childContainer: {
		marginLeft: theme.spacing(1),
		marginRight: theme.spacing(1),
	},
}));

interface Props {
	children: React.ReactNode;
	accept: () => void;
}

const GenericVaultAdvisory = ({ children, accept }: Props): JSX.Element => {
	const classes = useStyles();

	const [read, setRead] = useState(false);
	const handleAccept = () => {
		if (read) {
			accept();
		}
	};

	return (
		<div className={classes.vaultAdvisoryContainer}>
			<div className={classes.childContainer}>{children}</div>
			<FormControlLabel
				control={<Checkbox name="read" onClick={() => setRead(!read)} size="small" color="primary" />}
				label="I have read and understand the above vault advisory"
			/>
			<ActionButton
				aria-label="Deposit"
				size="large"
				onClick={handleAccept}
				variant="contained"
				color="secondary"
				disabled={!read}
				fullWidth
			>
				Accept
			</ActionButton>
		</div>
	);
};

export default GenericVaultAdvisory;
