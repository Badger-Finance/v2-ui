import React from 'react';
import { Button, makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
	actionButton: {
		color: '#2E44C0',
	},
	actionLabel: {
		fontSize: 14,
		fontWeight: 500,
		letterSpacing: 1.25,
		textTransform: 'uppercase',
	},
});

interface Props {
	text: string;
	onClose: () => void;
}

const BannerCloseActionButton = ({ text, onClose }: Props): JSX.Element => {
	const classes = useStyles();
	return (
		<Button
			variant="text"
			className={classes.actionButton}
			classes={{ label: classes.actionLabel }}
			onClick={onClose}
		>
			{text}
		</Button>
	);
};

export default BannerCloseActionButton;
