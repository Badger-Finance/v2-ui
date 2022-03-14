import React, { useContext, useEffect, useRef, useState } from 'react';
import { Grid, makeStyles } from '@material-ui/core';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import CurrencyDisplay from '../common/CurrencyDisplay';
import { inCurrency } from '../../mobx/utils/helpers';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import { Skeleton } from '@material-ui/lab';
import BigNumber from 'bignumber.js';
import { getFormattedNetworkName } from '../../utils/componentHelpers';
import { Typography } from 'ui-library/Typography';

const useStyles = makeStyles((theme) => ({
	root: {
		position: 'relative',
		width: 'calc(100% + 30px)',
		margin: '-30px 0 0 -30px',
		overflowY: 'hidden',
		[theme.breakpoints.down('sm')]: {
			overflowX: 'auto',
			flexWrap: 'nowrap',
		},
		'& > *': {
			display: 'flex',
			margin: '30px 0 0 30px',
			flexWrap: 'none',
			flexShrink: 0,
		},
	},
	loader: {
		display: 'inline-flex',
		marginLeft: 4,
	},
	assets: {
		[theme.breakpoints.down('md')]: {
			display: 'none',
		},
	},
	arrowRightContainer: {
		position: 'absolute',
		top: 0,
		right: 0,
		justifyContent: 'center',
		display: 'flex',
		alignItems: 'center',
		width: 36,
		height: 46,
		zIndex: 1,
		opacity: 0.8,
		cursor: 'pointer',
		background: '#2a2a2a',
	},
}));

export const NavbarStats = observer((): JSX.Element => {
	const {
		prices,
		onboard,
		user,
		network: { network },
		rewards: { badgerTree },
		uiState: { currency },
		vaults: { protocolSummary },
	} = useContext(StoreContext);

	const barRef = useRef<HTMLDivElement>(null);
	const [hasScrollableContent, setHasScrollableContent] = useState(false);
	const [hasReachedScrollEnd, setHasReachedScrollEnd] = useState(false);
	const classes = useStyles();

	const badgerToken = network.deploy.token.length > 0 ? network.deploy.token : undefined;
	const badgerPrice = badgerToken ? prices.getPrice(badgerToken) : undefined;
	const totalValueLocked = protocolSummary ? new BigNumber(protocolSummary.totalValue) : undefined;
	const portfolioValue = onboard.isActive() && user.initialized ? user.portfolioValue : new BigNumber(0);
	const chainName = getFormattedNetworkName(network);
	const valuePlaceholder = <Skeleton animation="wave" width={32} className={classes.loader} />;

	const handleScrollClick = () => {
		if (barRef.current) {
			barRef.current.scrollTo({
				top: 0,
				left: barRef.current.scrollLeft + 50,
				behavior: 'smooth',
			});
		}
	};

	useEffect(() => {
		const ref = barRef.current;

		const sizeObserver = new ResizeObserver((entries) => {
			const target = entries[0].target as HTMLDivElement;
			const hasReachedEnd = target.scrollLeft + target.offsetWidth === target.scrollWidth;
			setHasScrollableContent(target.scrollWidth > target.clientWidth);
			setHasReachedScrollEnd(hasReachedEnd);
		});

		function updateScrollPosition(event: Event) {
			const target = event.target as HTMLDivElement;
			const hasReachedEnd = target.scrollLeft + target.offsetWidth === target.scrollWidth;
			setHasReachedScrollEnd(hasReachedEnd);
		}

		if (ref) {
			setHasScrollableContent(ref.scrollWidth > ref.clientWidth);
			sizeObserver.observe(ref);
			ref.addEventListener('scroll', updateScrollPosition);

			return () => {
				ref.removeEventListener('scroll', updateScrollPosition);
				sizeObserver.unobserve(ref);
			};
		}
	}, []);

	return (
		<>
			{hasScrollableContent && !hasReachedScrollEnd && (
				<div className={classes.arrowRightContainer} onClick={handleScrollClick}>
					<ChevronRightIcon />
				</div>
			)}
			<Grid container className={classes.root} ref={barRef} id="here-ref">
				<Grid item>
					<Typography variant="helperText" display="inline">
						Badger Price: &nbsp;
					</Typography>
					{badgerPrice ? (
						<CurrencyDisplay
							displayValue={inCurrency(badgerPrice, currency)}
							variant="helperText"
							justifyContent="flex-start"
						/>
					) : (
						valuePlaceholder
					)}
				</Grid>
				<Grid item>
					<Typography variant="helperText" display="inline">
						Cycle: {badgerTree.cycle} &nbsp;
						{badgerTree.timeSinceLastCycle && `(latest ${badgerTree.timeSinceLastCycle})`}
					</Typography>
				</Grid>
				<Grid item>
					<Typography variant="helperText" display="inline">
						{chainName} TVL: &nbsp;
					</Typography>
					{totalValueLocked ? (
						<CurrencyDisplay
							displayValue={inCurrency(totalValueLocked, currency, 0)}
							variant="helperText"
							justifyContent="flex-start"
						/>
					) : (
						valuePlaceholder
					)}
				</Grid>
				<Grid item className={classes.assets}>
					<Typography variant="helperText" display="inline">
						My Assets: &nbsp;
					</Typography>
					<CurrencyDisplay
						displayValue={inCurrency(portfolioValue, currency)}
						variant="helperText"
						justifyContent="flex-start"
					/>
				</Grid>
			</Grid>
		</>
	);
});
