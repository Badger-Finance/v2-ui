import React from 'react';
import { Grid } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import PageHeader from 'components-v2/common/PageHeader';
import { NETWORK_LIST } from 'config/constants';
import { NftList } from './NftList';
import { PoolBalance } from './PoolBalance';
import { HeaderContainer, LayoutContainer } from '../../components-v2/common/Containers';

const HoneybadgerDrop: React.FC = observer(() => {
	const store = React.useContext(StoreContext);

	const { network, connectedAddress } = store.wallet;

	return (
		<LayoutContainer>
			<Grid container spacing={1} justify="center">
				<HeaderContainer item xs={12}>
					<PageHeader title="DIAMOND HANDS" subtitle="MEME Honeypot pt. II" />
				</HeaderContainer>
				{network.name === NETWORK_LIST.ETH ? (
					<>
						<Grid item xs={12} container spacing={5}>
							<PoolBalance />
							{connectedAddress && <NftList />}
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
