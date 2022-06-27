import React from 'react';
import { Link, Typography } from '@material-ui/core';
import { BveCvxInfoDialog } from '../BveCvxInfoDialog';

interface Props {
	open: boolean;
	onClose: () => void;
}

const BveCvxWithdrawalInfo = ({ open, onClose }: Props): JSX.Element => {
	return (
		<BveCvxInfoDialog open={open} onClose={onClose}>
			<BveCvxInfoDialog.Title onClose={onClose} title="CVX Withdrawable" />
			<BveCvxInfoDialog.Content>
				<Typography variant="body1" color="textSecondary">
					Each week, this vault locks batches of CVX tokens for a 16 week period. As vlCVX unlocks on a
					rolling basis, CVX becomes available to withdraw from the vault. Alternatively, bveCVX may be traded
					for CVX via the{' '}
					<Link href="https://curve.fi/factory/52/" target="_blank" rel="noopener" display="inline">
						Curve pool
					</Link>{' '}
					at any time.
				</Typography>
				<BveCvxInfoDialog.Divider />
				<Typography variant="body2" color="textSecondary">
					- CVX tokens are locked each Thursday just before 00:00 UTC
				</Typography>
				<Typography variant="body2" color="textSecondary">
					- Unlocked CVX is withdrawable from 00:01 UTC each Thursday until the next locking event
				</Typography>
				<Typography variant="body2" color="textSecondary">
					- The unlocking schedule for bveCVX can be found on this{' '}
					<Link
						href="https://dune.com/tianqi/Convex-Locked-CVX"
						target="_blank"
						rel="noopener"
						display="inline"
					>
						Dune dashboard
					</Link>
					.
				</Typography>
			</BveCvxInfoDialog.Content>
		</BveCvxInfoDialog>
	);
};

export default BveCvxWithdrawalInfo;
