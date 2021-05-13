import React from 'react';
import { Container, Grid, makeStyles } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import PageHeader from 'components-v2/common/PageHeader';
import { NETWORK_IDS } from 'config/constants';
import routes from 'config/routes';
import { NftList } from './NftList';
import { PoolBalance } from './PoolBalance';

const useStyles = makeStyles((theme) => ({
	root: {
		[theme.breakpoints.up('md')]: {
			paddingLeft: theme.spacing(30),
		},
	},
	headerContainer: {
		marginTop: theme.spacing(3),
		marginBottom: theme.spacing(3),
	},
	center: {
		margin: 'auto',
	},
	centerText: {
		textAlign: 'center',
	},
	mainPapers: {
		padding: theme.spacing(2),
	},
	redeemButton: {
		marginTop: theme.spacing(2),
		color: theme.palette.common.black,
	},
	nftContainer: {
		[theme.breakpoints.only('xs')]: {
			margin: theme.spacing(2, 'auto'),
		},
	},
	holdingsTitle: {
		marginTop: theme.spacing(4),
		marginBottom: theme.spacing(2),
		[theme.breakpoints.down('sm')]: {
			textAlign: 'center',
		},
		[theme.breakpoints.up('md')]: {
			paddingLeft: theme.spacing(4),
		},
	},
	nftSkeleton: {
		borderRadius: theme.spacing(1),
	},
	learnMore: {
		marginTop: theme.spacing(1),
		padding: theme.spacing(1),
	},
}));

const HoneybadgerDrop: React.FC = observer(() => {
	const store = React.useContext(StoreContext);
	const classes = useStyles();

	const { network, connectedAddress } = store.wallet;

	if (network.networkId !== NETWORK_IDS.ETH) {
		store.router.goTo(routes.home);
	}

	return (
		<Container className={classes.root}>
			<Grid container spacing={1} justify="center">
				<Grid item xs={12} className={classes.headerContainer}>
					<PageHeader title="DIAMOND HANDS" subtitle="MEME Honeypot pt. II" />
				</Grid>
				<Grid item xs={12} container spacing={5}>
					<PoolBalance />
					{connectedAddress && <NftList />}
				</Grid>
			</Grid>
		</Container>
	);
});

export default HoneybadgerDrop;
