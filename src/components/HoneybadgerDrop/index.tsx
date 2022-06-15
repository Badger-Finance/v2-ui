import React from 'react';
import { Grid } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import PageHeader from 'components-v2/common/PageHeader';
import { NftList } from './NftList';
import { PoolBalance } from './PoolBalance';
import { LayoutContainer, PageHeaderContainer } from '../../components-v2/common/Containers';
import { Network } from '@badger-dao/sdk';

const HoneybadgerDrop: React.FC = observer(() => {
	const store = React.useContext(StoreContext);
	const { network } = store.network;
	const { wallet } = store;

	return (
		<LayoutContainer>
			<Grid container spacing={1} justifyContent="center">
				<PageHeaderContainer item xs={12}>
					<PageHeader title="DIAMOND HANDS" subtitle="MEME Honeypot pt. II" />
				</PageHeaderContainer>
				{network.symbol === Network.Ethereum ? (
					<>
						<Grid item xs={12} container spacing={5}>
							<PoolBalance />
							{wallet.isConnected && <NftList />}
						</Grid>
					</>
				) : (
					<>
						<Grid item xs={12}>
							The Honey Badger Drop - Diamond Hands - is available on ETH Mainnet only.
						</Grid>
					</>
				)}
			</Grid>
		</LayoutContainer>
	);
});

export default HoneybadgerDrop;
