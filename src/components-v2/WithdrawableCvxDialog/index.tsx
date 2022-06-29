import {
	Dialog,
	DialogContent,
	DialogTitle,
	Divider,
	IconButton,
	Link,
	makeStyles,
	Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import React from 'react';

const useStyles = makeStyles({
	root: { padding: 20 },
	closeButton: {
		position: 'absolute',
		top: 25,
		right: 25,
	},
	divider: {
		width: '100%',
		margin: '20x 0',
	},
});

interface Props {
	open: boolean;
	onClose: () => void;
}

const WithdrawableCvxDialog = (props: Props) => {
	const classes = useStyles();
	return (
		<Dialog {...props}>
			<DialogTitle>
				CVX Withdrawable
				<IconButton aria-label="close dialog" className={classes.closeButton} onClick={props.onClose}>
					<CloseIcon />
				</IconButton>
			</DialogTitle>
			<DialogContent>
				<Typography variant="body1">
					Each week, this vault locks batches of CVX tokens for a 16 week period. As vlCVX unlocks on a
					rolling basis, CVX becomes available to withdraw from the vault. Alternatively, bveCVX may be traded
					for CVX via the{' '}
					<Link href="https://curve.fi/factory/52/" target="_blank" rel="noopener" display="inline">
						Curve pool
					</Link>{' '}
					at any time.
				</Typography>
				<Divider className={classes.divider} />
				<Typography variant="body2" color="textSecondary">
					- CVX tokens are locked each Thursday just before 00:00 UTC
				</Typography>
				<Typography variant="body2" color="textSecondary">
					- Unlocked CVX is withdrawable from 00:01 UTC each Thursday until the next locking event
				</Typography>
				<Typography variant="body2" color="textSecondary">
					- The unlocking schedule for bveCVX can be found on this{' '}
					<Link
						href="https://dune.com/tianqi/Convex-Locked-CVX-V2(Sponsored-by-Badger)"
						target="_blank"
						rel="noopener"
						display="inline"
					>
						Dune dashboard
					</Link>
					.
				</Typography>
			</DialogContent>
		</Dialog>
	);
};

export default WithdrawableCvxDialog;
