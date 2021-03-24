import React from 'react';
import {
	Button,
	Container,
	Grid,
	makeStyles,
	Paper,
	Typography,
	Fade,
	useMediaQuery,
	useTheme,
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import _isNil from 'lodash/isNil';
import { observer } from 'mobx-react-lite';
import { diggToCurrency } from 'mobx/utils/helpers';
import { StoreContext } from 'mobx/store-context';
import { useBdiggToDigg, useConnectWallet } from 'mobx/utils/hooks';
import Hero from 'components/Common/Hero';
import NftStats from './NftStats';
import { NoWalletPlaceHolder } from './NoWalletPlaceHolder';
import { TypographySkeleton } from './TypographySkeleton';
import { NFT } from 'mobx/model';
import { NftAmountSelector } from './NftAmountSelector';

interface NftAmountPromp {
	open: boolean;
	nft?: NFT;
}

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
}));

const initialPromptState = { open: false, nft: undefined };

export const HoneybadgerDrop: React.FC = observer(() => {
	const store = React.useContext(StoreContext);
	const classes = useStyles();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.only('xs'));
	const bdiggToDigg = useBdiggToDigg();
	const connectWallet = useConnectWallet();
	const [nftAmountPromp, setNftAmountPromp] = React.useState<NftAmountPromp>(initialPromptState);

	const { connectedAddress } = store.wallet;
	const { poolBalance, loadingPoolBalance, loadingNfts, nfts, nftBeingRedeemed } = store.honeyPot;
	const poolBalanceDiggs = poolBalance && bdiggToDigg(poolBalance);

	return (
		<Container className={classes.root}>
			<Grid container spacing={1} justify="center">
				<Grid item xs={12} className={classes.headerContainer}>
					<Hero title="HONEY DIAMOND HANDS" subtitle="MEME Honey Pot 2 - Diamond Hands" />
				</Grid>
				<Grid item xs={12} container spacing={5}>
					<Fade in>
						<Grid item container justify="center" xs={12} className={classes.centerText}>
							<Grid item xs={12} sm={8} md={7}>
								<Paper elevation={0} className={classes.mainPapers}>
									<Grid container spacing={1}>
										<Grid item xs={12}>
											<Typography>Remaining Honey Pot Pool</Typography>
										</Grid>
										{connectedAddress && (
											<>
												<NoWalletPlaceHolder>
													<Grid item xs={12}>
														<TypographySkeleton
															variant="h5"
															color="textPrimary"
															width="30%"
															loading={loadingPoolBalance || !poolBalance}
														>
															{poolBalance &&
																`${poolBalance.dividedBy(1e18).toFixed(2)} bDIGG`}
														</TypographySkeleton>
													</Grid>
													<Grid item xs={12}>
														<TypographySkeleton
															variant="subtitle1"
															color="textSecondary"
															width="30%"
															loading={loadingPoolBalance || !!poolBalanceDiggs?.isNaN()}
														>
															{poolBalanceDiggs &&
																`${poolBalanceDiggs
																	.dividedBy(1e18)
																	.toFixed(2)} DIGG / ${diggToCurrency({
																	amount: poolBalanceDiggs,
																	currency: 'btc',
																})}`}
														</TypographySkeleton>
													</Grid>
													<Grid item xs={12}>
														<TypographySkeleton
															variant="subtitle1"
															color="textSecondary"
															width="30%"
															loading={loadingPoolBalance || !!poolBalanceDiggs?.isNaN()}
														>
															{poolBalanceDiggs &&
																diggToCurrency({
																	amount: poolBalanceDiggs,
																	currency: 'usd',
																})}
														</TypographySkeleton>
													</Grid>
												</NoWalletPlaceHolder>
											</>
										)}
										{!loadingNfts && !connectedAddress && (
											<Grid item xs={12}>
												<Button
													className={classes.redeemButton}
													onClick={connectWallet}
													variant="contained"
													color="primary"
												>
													Check Rewards
												</Button>
											</Grid>
										)}
									</Grid>
								</Paper>
							</Grid>
						</Grid>
					</Fade>

					{connectedAddress && (
						<>
							{!nfts || loadingNfts ? (
								<Fade in>
									<Grid item container justify="center" xs={12}>
										<Grid item container xs={12} className={classes.holdingsTitle}>
											<Typography style={{ width: '100%' }}>Your Holdings</Typography>
										</Grid>
										<Grid item container xs={12} justify="space-between" spacing={isMobile ? 0 : 8}>
											{Array(3)
												.fill(null)
												.map(() => (
													<Grid className={classes.nftContainer} item xs={12} sm={6} lg={4}>
														<Skeleton
															variant="rect"
															width="100%"
															height={250}
															className={classes.nftSkeleton}
														/>
													</Grid>
												))}
										</Grid>
									</Grid>
								</Fade>
							) : (
								<>
									{nfts && (
										<Fade in>
											<Grid item container justify="center" xs={12}>
												<Grid item container xs={12} className={classes.holdingsTitle}>
													<Typography style={{ width: '100%' }}>Your Holdings</Typography>
												</Grid>
												{nfts.length > 0 ? (
													<Grid
														item
														container
														xs={12}
														justify="space-between"
														spacing={isMobile ? 0 : 8}
													>
														{nfts.map((nft) => {
															const {
																balance,
																tokenId,
																name,
																image,
																totalSupply,
																root,
																poolBalance,
															} = nft;

															const redemptionRate = store.honeyPot.calculateRedemptionRate(
																root,
															);

															const formattedRedemptionRate = diggToCurrency({
																amount: bdiggToDigg(redemptionRate),
																currency: 'usd',
															});

															const isBalanceEmpty = +balance < 1;

															return (
																<Grid
																	key={tokenId}
																	className={classes.nftContainer}
																	item
																	xs={12}
																	sm={6}
																	lg={4}
																>
																	<NftStats
																		nftId={tokenId}
																		name={name || 'NFT Name N/A'}
																		image={image}
																		balance={balance}
																		remaining={`${
																			Number(totalSupply) - Number(poolBalance)
																		}/${totalSupply}`}
																		redemptionRate={formattedRedemptionRate}
																		loading={nftBeingRedeemed.includes(tokenId)}
																		disabled={isBalanceEmpty}
																		onRedeem={() =>
																			setNftAmountPromp({ nft, open: true })
																		}
																	/>
																</Grid>
															);
														})}
													</Grid>
												) : (
													<Grid item container xs={12} justify="space-between">
														<Typography
															variant="h5"
															className={classes.center}
															color="textSecondary"
														>
															No Holdings
														</Typography>
													</Grid>
												)}
											</Grid>
										</Fade>
									)}
								</>
							)}
						</>
					)}
				</Grid>
			</Grid>
			{nftAmountPromp.nft && (
				<NftAmountSelector
					isOpen={nftAmountPromp.open}
					nft={nftAmountPromp.nft}
					onClose={() => setNftAmountPromp(initialPromptState)}
					onAmountSelected={(id: string, amount: number) => {
						store.honeyPot.redeemNFT(id, amount);
						setNftAmountPromp(initialPromptState);
					}}
				/>
			)}
		</Container>
	);
});

export default HoneybadgerDrop;
