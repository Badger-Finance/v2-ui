import React from 'react';
import { Button, Grid, IconButton, Link, makeStyles, Typography } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

export interface BannerProps {
	message: string;
	onClose: () => void;
	linkText?: string;
	link?: string;
	action?: React.ReactNode;
}

const useStyles = makeStyles({
	root: {
		minHeight: 48,
		padding: '14px 26px',
		background: '#BDE0FF',
	},
	messageLinkContainer: {
		display: 'flex',
	},
	linkIcon: {
		marginRight: 6,
	},
	actionButton: {
		color: '#2E44C0',
	},
	actionLabel: {
		fontSize: 14,
		fontWeight: 500,
		letterSpacing: 1.25,
		textTransform: 'uppercase',
	},
	link: {
		color: '#2E44C0',
		letterSpacing: '0.0025em',
		fontSize: 14,
		fontWeight: 'bold',
	},
	message: {
		fontWeight: 'normal',
		fontSize: 14,
		letterSpacing: 0.25,
		color: 'rgba(0, 0, 0, 0.87)',
		marginRight: 12,
	},
	actionContainer: {
		paddingLeft: 40,
	},
	closeIcon: {
		color: '#2E44C0',
		margin: '-12px',
		'& svg': {
			fontSize: 24,
		},
	},
});

const Banner = ({ message, link, linkText, action, onClose }: BannerProps): JSX.Element => {
	const classes = useStyles();
	return (
		<Grid container alignItems="center" className={classes.root} justifyContent="space-between">
			<Grid item container xs alignItems="center" className={classes.messageLinkContainer}>
				<Grid item>
					<Typography className={classes.message}>{message}</Typography>
				</Grid>
				{linkText && linkText && (
					<Grid item>
						<Link href={link} rel="noreferrer" target="_blank" className={classes.link}>
							<img
								className={classes.linkIcon}
								src="/assets/icons/banner-link-icon.svg"
								alt="banner link icon"
							/>
							{linkText}
						</Link>
					</Grid>
				)}
			</Grid>
			<Grid item xs="auto" className={classes.actionContainer}>
				{action ? (
					<Button
						variant="text"
						className={classes.actionButton}
						classes={{ label: classes.actionLabel }}
						onClick={onClose}
					>
						{action}
					</Button>
				) : (
					<IconButton onClick={onClose} className={classes.closeIcon} size="medium" aria-label="close banner">
						<CloseIcon />
					</IconButton>
				)}
			</Grid>
		</Grid>
	);
};

export default Banner;
