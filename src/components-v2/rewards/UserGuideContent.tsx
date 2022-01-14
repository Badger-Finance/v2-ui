import React, { useContext } from 'react';
import {
	Box,
	DialogContent,
	DialogTitle,
	Grid,
	IconButton,
	Link,
	Typography,
	useMediaQuery,
	useTheme,
} from '@material-ui/core';
import { ArrowBackIosOutlined } from '@material-ui/icons';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import ArrowRightAltIcon from '@material-ui/icons/ArrowRightAlt';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import { VaultType } from '@badger-dao/sdk';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		title: {
			padding: '33px 43px 10px 43px',
			[theme.breakpoints.down('xs')]: {
				padding: '24px 33px 10px 33px',
			},
		},
		content: {
			padding: '0px 43px 48px 43px',
			[theme.breakpoints.down('xs')]: {
				padding: '0px 33px 37px 33px',
			},
		},
		arrowBack: {
			position: 'absolute',
			left: 4,
			padding: 10,
			fontSize: 18,
			[theme.breakpoints.down('xs')]: {
				left: 0,
			},
		},
		userGuideTokens: {
			marginTop: theme.spacing(1),
		},
		userGuideToken: {
			backgroundColor: '#181818',
			padding: '21px 22px',
			borderRadius: 10,
			width: 219,
			height: 144,
		},
		rewardsOptions: {
			paddingInlineStart: theme.spacing(2),
			'& li:not(:last-child)': {
				marginBottom: theme.spacing(1),
			},
		},
		boldWeight: {
			fontWeight: 700,
		},
		tokenName: {
			marginBottom: theme.spacing(1),
		},
		tokensSection: {
			marginTop: theme.spacing(2),
		},
		cursorPointer: {
			cursor: 'pointer',
		},
	}),
);

interface Props {
	onGoBack: () => void;
	onClose: () => void;
}

const UserGuideContent = ({ onGoBack, onClose }: Props): JSX.Element => {
	const { vaults } = useContext(StoreContext);
	const classes = useStyles();
	const isMobile = useMediaQuery(useTheme().breakpoints.down('xs'));

	const goToBadgerTokens = () => {
		vaults.vaultsFilters.types = [VaultType.Native];
		onClose();
	};

	const goToBoostedTokens = () => {
		vaults.vaultsFilters.types = [VaultType.Boosted];
		onClose();
	};

	const goToNonBoostedTokens = () => {
		vaults.vaultsFilters.types = [VaultType.Standard];
		onClose();
	};

	return (
		<>
			<DialogTitle className={classes.title} disableTypography>
				<Box display="flex" alignItems="center">
					<IconButton aria-label="exit guide mode" className={classes.arrowBack} onClick={onGoBack}>
						<ArrowBackIosOutlined fontSize="inherit" />
					</IconButton>
					<Typography variant="h6" className={classes.boldWeight}>
						Rewards User Guide
					</Typography>
				</Box>
			</DialogTitle>
			<DialogContent className={classes.content}>
				<Grid container>
					<Grid item>
						<ul className={classes.rewardsOptions}>
							<li>
								<Typography variant="body2">Staking 50% non native tokens</Typography>
							</li>
							<li>
								<Typography variant="body2">Holding and/or Staking 50% BadgerDAO tokens</Typography>
							</li>
						</ul>
					</Grid>
					<Grid item container direction="column" xs={12} className={classes.tokensSection}>
						<Grid item>
							<Typography variant="subtitle2">Badger has 3 types of tokens:</Typography>
						</Grid>
						<Grid container spacing={isMobile ? 2 : 4} className={classes.userGuideTokens}>
							<Grid item>
								<Grid container direction="column" className={classes.userGuideToken}>
									<Grid item>
										<Typography className={classes.tokenName} variant="body2" color="textSecondary">
											BADGERDAO TOKENS:
										</Typography>
									</Grid>
									<Grid item>
										<Typography variant="subtitle2">Badger, Digg</Typography>
									</Grid>
									<Grid item xs container direction="column-reverse">
										<Box display="flex" alignItems="center">
											<ArrowRightAltIcon color="primary" />
											<Link className={classes.cursorPointer} onClick={goToBadgerTokens}>
												View Vaults
											</Link>
										</Box>
									</Grid>
								</Grid>
							</Grid>
							<Grid item>
								<Grid item container direction="column" className={classes.userGuideToken}>
									<Grid item>
										<Typography className={classes.tokenName} variant="body2" color="textSecondary">
											BOOSTED TOKENS:
										</Typography>
									</Grid>
									<Grid item>
										<Typography variant="subtitle2">
											ibBTC, crvsBTC LP, imBTC, Mhbtc, Cvxcrv, Tricrypto
										</Typography>
									</Grid>
									<Grid item xs container direction="column-reverse">
										<Box display="flex" alignItems="center">
											<ArrowRightAltIcon color="primary" />
											<Link className={classes.cursorPointer} onClick={goToBoostedTokens}>
												View Vaults
											</Link>
										</Box>
									</Grid>
								</Grid>
							</Grid>
							<Grid item>
								<Grid item container direction="column" className={classes.userGuideToken}>
									<Grid item>
										<Typography className={classes.tokenName} variant="body2" color="textSecondary">
											NON-BOOSTED TOKENS:
										</Typography>
									</Grid>
									<Grid item>
										<Typography variant="subtitle2">
											All other tokens (e.g. wBTC, renBTC...)
										</Typography>
									</Grid>
									<Grid item xs container direction="column-reverse">
										<Box display="flex" alignItems="center">
											<ArrowRightAltIcon color="primary" />
											<Link className={classes.cursorPointer} onClick={goToNonBoostedTokens}>
												View Vaults
											</Link>
										</Box>
									</Grid>
								</Grid>
							</Grid>
						</Grid>
					</Grid>
				</Grid>
			</DialogContent>
		</>
	);
};

export default observer(UserGuideContent);
