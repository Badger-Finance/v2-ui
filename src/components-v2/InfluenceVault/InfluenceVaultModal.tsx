import React, { useContext } from 'react';
import { Grid, makeStyles, Typography, Link } from '@material-ui/core';
import { StoreContext } from '../../mobx/store-context';
import { InfoDialog } from './InfoDialog';
import routes from '../../config/routes';
import { parseText } from './InfluenceVaultUtil';

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

	const createLink = (text: string, link: string) => {
		if (link.includes('http')) {
			return (
				<Link href={link} target="_blank" rel="noopener" display="inline">
					{text}
				</Link>
			);
		}
		return (
			<Link display="inline" className={classes.link} onClick={() => handleLinkClick(link)}>
				{text}
			</Link>
		);
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
								{parseText(point.title, createLink)}
							</Typography>
							<Typography variant="body2" color="textSecondary">
								{parseText(point.body, createLink)}
							</Typography>
						</Grid>
					))}
				</Grid>
			</InfoDialog.Content>
		</InfoDialog>
	);
};

export default InfluenceVaultModal;
