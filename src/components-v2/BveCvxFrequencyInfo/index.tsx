import React, { useContext } from 'react';
import { Link, makeStyles, Typography } from '@material-ui/core';
import { BveCvxInfoDialog } from '../BveCvxInfoDialog';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import routes from '../../config/routes';

const useStyles = makeStyles({
	link: {
		cursor: 'pointer',
		'&:hover': {
			textDecoration: 'underline',
		},
	},
});

interface Props {
	open: boolean;
	onClose: () => void;
}

const BveCvxFrequencyInfo = ({ open, onClose }: Props): JSX.Element => {
	const classes = useStyles();
	const { router } = useContext(StoreContext);
	const handleLinkClick = () => {
		router.goTo(routes.vaultDetail, { vaultName: 'convex-cvxcrv' }, { chain: router.queryParams?.chain });
	};
	return (
		<BveCvxInfoDialog open={open} onClose={onClose}>
			<BveCvxInfoDialog.Title onClose={onClose} title="Reward Frequency" />
			<BveCvxInfoDialog.Content>
				<Typography variant="body1" color="textSecondary">
					bveCVX and BADGER rewards are distributed at the completion of each bi-weekly voting/bribing round,
					after bribes for that round have been sold. Convex locking rewards are distributed each ~2hr cycle
					as autocompounding{' '}
					<Link display="inline" className={classes.link} onClick={handleLinkClick}>
						bcvxCRV
					</Link>
					.
				</Typography>
				<BveCvxInfoDialog.Divider />
				<Typography variant="body2" color="textSecondary">
					- 75% of bribe sales (after fees): sold for bveCVX
				</Typography>
				<Typography variant="body2" color="textSecondary">
					- 25% of bribe sales (after fees): sold for BADGER
				</Typography>
				<Typography variant="body2" color="textSecondary">
					- Convex vlCVX locking rewards: claimable as autocompounding bCvxCRV
				</Typography>
				<Typography variant="body2" color="textSecondary">
					- All rewards are claimable through the app
				</Typography>
			</BveCvxInfoDialog.Content>
		</BveCvxInfoDialog>
	);
};

export default observer(BveCvxFrequencyInfo);
