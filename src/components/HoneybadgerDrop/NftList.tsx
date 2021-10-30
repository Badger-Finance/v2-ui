import React from 'react';
import { Grid, makeStyles, Typography, Fade, useMediaQuery, useTheme } from '@material-ui/core';
import NftStats from './NftStats';
import { Skeleton } from '@material-ui/lab';
import { StoreContext } from 'mobx/store-context';
import { observer } from 'mobx-react-lite';
import { NFT } from '../../mobx/model/boost/NFT';

const useStyles = makeStyles((theme) => ({
	center: {
		margin: 'auto',
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
	nftContainer: {
		[theme.breakpoints.only('xs')]: {
			margin: theme.spacing(2, 'auto'),
		},
	},
	nftSkeleton: {
		borderRadius: theme.spacing(1),
	},
}));

const Container = ({ children }: { children: React.ReactNode }) => {
	const classes = useStyles();
	return (
		<Fade in>
			<Grid item container justify="center" xs={12}>
				<Grid item container xs={12} className={classes.holdingsTitle}>
					<Typography style={{ width: '100%' }}>Your Holdings</Typography>
				</Grid>
				{children}
			</Grid>
		</Fade>
	);
};

export const NftList = observer(() => {
	const store = React.useContext(StoreContext);
	const classes = useStyles();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.only('xs'));

	const { loadingNfts, nfts, nftBeingRedeemed } = store.honeyPot;

	if (loadingNfts || !nfts) {
		return (
			<Container>
				<Grid item container xs={12} justify="space-between" spacing={isMobile ? 0 : 8}>
					{Array(3)
						.fill(null)
						.map((_, index: number) => (
							<Grid className={classes.nftContainer} item xs={12} sm={6} lg={4} key={index}>
								<Skeleton variant="rect" width="100%" height={450} className={classes.nftSkeleton} />
							</Grid>
						))}
				</Grid>
			</Container>
		);
	}

	if (nfts.length === 0) {
		return (
			<Container>
				<Grid item container xs={12} justify="space-between">
					<Typography variant="h5" className={classes.center} color="textSecondary">
						No Holdings
					</Typography>
				</Grid>
			</Container>
		);
	}

	return (
		<Container>
			<Grid item container xs={12} justify="space-between" spacing={isMobile ? 0 : 8}>
				{nfts.map(({ balance, tokenId, name, image, totalSupply, poolBalance, root, redirectUrl }: NFT) => {
					const redemptionRate = store.honeyPot.calculateRedemptionRate(root);
					const isBalanceEmpty = +balance < 1;

					return (
						<Grid key={tokenId} className={classes.nftContainer} item xs={12} sm={6} lg={4}>
							<NftStats
								nftId={tokenId}
								name={name || 'NFT Name N/A'}
								image={image}
								redirectUrl={redirectUrl}
								balance={balance}
								remaining={`${Number(totalSupply) - Number(poolBalance)}/${totalSupply}`}
								redemptionRateUsd={redemptionRate.toString()}
								redemptionRateBdigg={redemptionRate.div(1e18).toString()}
								loading={nftBeingRedeemed.includes(tokenId)}
								disabled={isBalanceEmpty}
								onRedeem={() => {
									store.honeyPot.redeemNFT(tokenId, 1);
								}}
							/>
						</Grid>
					);
				})}
			</Grid>
		</Container>
	);
});
