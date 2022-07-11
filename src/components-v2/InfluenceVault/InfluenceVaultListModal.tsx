import React, { useContext } from 'react';
import { Link, makeStyles, Typography } from '@material-ui/core';
import { InfoDialog } from './InfoDialog';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import routes from '../../config/routes';
import { parseText } from './InfluenceVaultUtil';

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
	info: any;
}

const InfluenceVaultListModal = ({ open, onClose, info }: Props): JSX.Element => {
	const classes = useStyles();
	const { router } = useContext(StoreContext);
	const handleLinkClick = (link: string) => {
		router.goTo(routes.vaultDetail, { vaultName: link }, { chain: router.queryParams?.chain });
	};

	const createLink = (text: string, link: string) => {
		if (link.includes('http')) {
			return (
				<Link href={link} key={text} target="_blank" rel="noopener" display="inline">
					{text}
				</Link>
			);
		}
		return (
			<Link display="inline" key={text} className={classes.link} onClick={() => handleLinkClick(link)}>
				{text}
			</Link>
		);
	};
	return (
		<InfoDialog open={open} onClose={onClose}>
			<InfoDialog.Title onClose={onClose} title={info.title} />
			<InfoDialog.Content>
				<Typography variant="body1" color="textSecondary">
					{parseText(info.body, createLink)}
				</Typography>
				<InfoDialog.Divider />
				{info.points.map((point: string[], index: number) => (
					<Typography key={index} variant="body2" color="textSecondary">
						{' '}
						{parseText(point, createLink)}{' '}
					</Typography>
				))}
			</InfoDialog.Content>
		</InfoDialog>
	);
};

export default observer(InfluenceVaultListModal);
