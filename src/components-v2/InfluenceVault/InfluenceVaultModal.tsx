import React, { useContext } from 'react';
import { Grid, makeStyles, Typography, Link } from '@material-ui/core';
import { StoreContext } from '../../mobx/store-context';
import { InfoDialog } from './InfoDialog';
import routes from '../../config/routes';
import MarkupText from 'components-v2/common/MarkupText';

const useStyles = makeStyles(() => ({
	feeSpec: {
		marginBottom: 25,
	},
	specTitle: {
		fontWeight: 700,
	},
	link: {
		cursor: 'pointer',
		'&:hover': {
			textDecoration: 'underline',
		},
	},
}));

interface Props {
	open: boolean;
	onClose: () => void;
	info: any;
}

const InfluenceVaultModal = ({ open, onClose, info }: Props): JSX.Element => {
	const classes = useStyles();
	const { router } = useContext(StoreContext);
	const handleLinkClick = (link: string) => {
		router.goTo(routes.vaultDetail, { vaultName: link }, { chain: router.queryParams?.chain });
	};

	return (
		<InfoDialog open={open} onClose={onClose}>
			<InfoDialog.Title onClose={onClose} title="Vote Influence Fees" />
			<InfoDialog.Content>
				<Typography variant="body1" color="textSecondary">
					{info.title}
				</Typography>
				<InfoDialog.Divider />
				<Grid container direction="column">
					{info.points.map((point: any, index: number) => (
						<Grid item key={index} className={classes.feeSpec}>
							<Typography className={classes.specTitle} variant="body2" color="textSecondary">
								<MarkupText text={point.title} onClick={handleLinkClick} />
							</Typography>
							<Typography variant="body2" color="textSecondary">
								<MarkupText text={point.body} onClick={handleLinkClick} />
							</Typography>
						</Grid>
					))}
				</Grid>
			</InfoDialog.Content>
		</InfoDialog>
	);
};

export default InfluenceVaultModal;
