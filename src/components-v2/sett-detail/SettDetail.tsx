import React, { useState, useContext } from 'react';
import { Container, makeStyles, Typography } from '@material-ui/core';
import { Header } from './Header';
import { MainContent } from './MainContent';
import { observer } from 'mobx-react-lite';
import { Footer } from './Footer';
import { StoreContext } from '../../mobx/store-context';
import { MobileStickyActionButtons } from './actions/MobileStickyActionButtons';
import { Loader } from '../../components/Loader';
import { TopContent } from './TopContent';
import { SettDeposit } from '../common/dialogs/SettDeposit';
import { SettWithdraw } from '../common/dialogs/SettWithdraw';

const useStyles = makeStyles((theme) => ({
	root: {
		paddingTop: theme.spacing(0.5),
		marginTop: theme.spacing(2),
	},
	notReadyContainer: {
		textAlign: 'center',
		marginTop: theme.spacing(10),
	},
}));

export const SettDetail = observer(
	(): JSX.Element => {
		const {
			wallet: { connectedAddress },
			settDetail: { sett, isLoading, isNotFound },
			network: { network },
		} = useContext(StoreContext);

		const [openDepositDialog, setOpenDepositDialog] = useState(false);
		const [openWithdrawDialog, setOpenWithdrawDialog] = useState(false);
		const classes = useStyles();
		const badgerSett = network.setts.find(({ vaultToken }) => vaultToken.address === sett?.vaultToken);

		if (isLoading) {
			return (
				<Container className={classes.root}>
					<div className={classes.notReadyContainer}>
						<Loader message="Loading Sett Information" />
					</div>
				</Container>
			);
		}

		if (isNotFound) {
			return (
				<Container className={classes.root}>
					<div className={classes.notReadyContainer}>
						{/*TODO: replace with not found logo*/}
						<Typography>Sett Not Found</Typography>
					</div>
				</Container>
			);
		}

		return (
			<>
				<Container className={classes.root}>
					<Header />
					{sett && (
						<>
							<TopContent
								sett={sett}
								onWithdrawClick={() => setOpenWithdrawDialog(true)}
								onDepositClick={() => setOpenDepositDialog(true)}
							/>
							<MainContent sett={sett} />
						</>
					)}
					<Footer />
				</Container>
				{sett && badgerSett && (
					<>
						<SettDeposit
							open={openDepositDialog}
							sett={sett}
							badgerSett={badgerSett}
							onClose={() => setOpenDepositDialog(false)}
						/>
						<SettWithdraw
							open={openWithdrawDialog}
							sett={sett}
							badgerSett={badgerSett}
							onClose={() => setOpenWithdrawDialog(false)}
						/>
					</>
				)}
				{connectedAddress && (
					<MobileStickyActionButtons
						onWithdrawClick={() => setOpenWithdrawDialog(true)}
						onDepositClick={() => setOpenDepositDialog(true)}
					/>
				)}
			</>
		);
	},
);
