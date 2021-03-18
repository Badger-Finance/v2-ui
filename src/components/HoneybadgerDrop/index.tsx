import React, { useContext } from 'react';
import {
	Button,
	Container,
	Grid,
	makeStyles,
	Paper,
	Typography,
	TypographyProps,
	useMediaQuery,
	useTheme,
} from '@material-ui/core';
import Hero from 'components/Common/Hero';
import NFT from './NFT';
import { StoreContext } from 'mobx/store-context';
import { Skeleton as MaterialSkeleton, SkeletonProps as MaterialSkeletonProps } from '@material-ui/lab';
import { observer } from 'mobx-react-lite';
import { diggToCurrency } from 'mobx/utils/helpers';
import { usePoolDigg } from './honeypot.hooks';

const TypographySkeleton: React.FC<Omit<MaterialSkeletonProps, 'variant'> & TypographyProps & { loading: boolean }> = ({
	loading,
	children,
	color,
	variant,
	...skeletonOptions
}) => (
	<Typography {...{ color, variant }}>
		{loading ? <MaterialSkeleton {...skeletonOptions} style={{ margin: 'auto' }} /> : children}
	</Typography>
);

const useStyles = makeStyles((theme) => ({
	root: {
		marginTop: theme.spacing(11),
		marginBottom: theme.spacing(10),
		[theme.breakpoints.up('md')]: {
			paddingLeft: theme.spacing(33),
			marginTop: theme.spacing(2),
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
}));

export const HoneybadgerDrop: React.FC = observer(() => {
	const store = useContext(StoreContext);
	const classes = useStyles();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.only('xs'));
	const digg = usePoolDigg();

	const { poolBalance, loadingPoolBalance, loadingNfts, nfts } = store.honeyPot;

	console.log({ nfts: Array.from(nfts || []) });

	return (
		<Container className={classes.root}>
			<Grid container spacing={1} justify="center">
				<Grid item xs={12} className={classes.headerContainer}>
					<Hero title="HONEY BADGER DROP" subtitle="MEME Honey Pot 2 - Diamond Hands" />
				</Grid>
				<Grid item xs={12} container spacing={5}>
					<Grid item container justify="center" xs={12} className={classes.centerText}>
						<Grid item xs={12} sm={8} md={7}>
							<Paper elevation={0} className={classes.mainPapers}>
								<Grid container spacing={1}>
									<Grid item xs={12}>
										<Typography>Remaining Honey Pot Pool</Typography>
									</Grid>
									<Grid item xs={12}>
										<TypographySkeleton
											variant="h5"
											color="textPrimary"
											width="30%"
											loading={loadingPoolBalance || !poolBalance}
										>
											{poolBalance && `${poolBalance.dividedBy(1e18).toFixed(2)} bDIGG`}
										</TypographySkeleton>
									</Grid>
									<Grid item xs={12}>
										<TypographySkeleton
											variant="subtitle1"
											color="textSecondary"
											width="30%"
											loading={loadingPoolBalance || !!digg?.isNaN()}
										>
											{digg &&
												`${digg.dividedBy(1e18).toFixed(2)} DIGG / ${diggToCurrency({
													amount: digg,
													currency: 'btc',
												})}`}
										</TypographySkeleton>
									</Grid>
									<Grid item xs={12}>
										<TypographySkeleton
											variant="subtitle1"
											color="textSecondary"
											width="30%"
											loading={loadingPoolBalance || !!digg?.isNaN()}
										>
											{digg && diggToCurrency({ amount: digg, currency: 'usd' })}
										</TypographySkeleton>
									</Grid>
								</Grid>
							</Paper>
						</Grid>
					</Grid>
					<Grid item container justify="center" xs={12} className={classes.centerText}>
						<Grid item xs={12} sm={8} md={5}>
							<Paper elevation={0} className={classes.mainPapers}>
								<Grid container spacing={1}>
									<Grid item xs={12}>
										<Typography>Available Rewards</Typography>
									</Grid>
									<Grid item container spacing={1} xs={12}>
										<Grid item xs container>
											<Grid item xs={12}>
												<TypographySkeleton
													variant="h5"
													color="textPrimary"
													width="20%"
													loading={loadingNfts || !nfts}
												>
													{nfts?.length}
												</TypographySkeleton>
											</Grid>
											<Grid item xs={12}>
												<Typography variant="subtitle1" color="textSecondary">
													NFTs Held
												</Typography>
											</Grid>
										</Grid>
										<Grid item xs container>
											<Grid item xs={12}>
												<Typography variant="h5" color="textPrimary">
													$5,572
												</Typography>
											</Grid>
											<Grid item xs={12}>
												<Typography variant="subtitle1" color="textSecondary">
													Next Redemption Rate
												</Typography>
											</Grid>
										</Grid>
										<Grid item xs={12}>
											<Button
												className={classes.redeemButton}
												variant="contained"
												color="primary"
											>
												Redeem All
											</Button>
										</Grid>
									</Grid>
								</Grid>
							</Paper>
						</Grid>
					</Grid>
					{/* TODO: add skeletons for this */}
					{nfts && nfts.length > 0 && (
						<Grid item container justify="center" xs={12}>
							<Grid item container xs={12} className={classes.holdingsTitle}>
								<Typography style={{ width: '100%' }}>Your Holdings</Typography>
							</Grid>
							<Grid item container xs={12} justify="space-between" spacing={isMobile ? 0 : 8}>
								{nfts.map(({ balance, tokenId, name }) => (
									<Grid key={tokenId} className={classes.nftContainer} item xs={12} sm={6} lg={4}>
										<NFT
											name={name || 'Unnamed NFT'}
											balance={balance}
											remaining="426/500"
											redemptionRate="$572.05"
										/>
									</Grid>
								))}
							</Grid>
						</Grid>
					)}
				</Grid>
			</Grid>
		</Container>
	);
});

export default HoneybadgerDrop;
