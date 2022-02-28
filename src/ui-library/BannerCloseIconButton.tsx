import React from 'react';
import CloseIcon from '@material-ui/icons/Close';
import { IconButton, makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
	closeIcon: {
		color: '#2E44C0',
		margin: '-12px',
		'& svg': {
			fontSize: 24,
		},
	},
});

interface Props {
	onClose: () => void;
}

const BannerCloseIconButton = ({ onClose }: Props): JSX.Element => {
	const classes = useStyles();
	return (
		<IconButton onClick={onClose} className={classes.closeIcon} size="medium" aria-label="close banner">
			<CloseIcon />
		</IconButton>
	);
};

export default BannerCloseIconButton;
