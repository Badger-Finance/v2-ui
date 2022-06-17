import { Grid, IconButton } from '@material-ui/core';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import { useContext, useEffect, useState } from 'react';

import { LayoutContainer, PageHeaderContainer } from '../../components-v2/common/Containers';
import PageHeader from '../../components-v2/common/PageHeader';
import AddressInfoCard from './AddressInfoCard';
import EventsTable from './EventsTable';
import GovernanceFilterDialog from './GovernanceFilterDialog';

const GovernancePortal = observer(() => {
	const store = useContext(StoreContext);
	const { governancePortal } = store;
	const [showGovernanceFilters, setShowGovernanceFilters] = useState(false);
	const [filters, setFilters] = useState<string[]>([]);
	useEffect(() => {
		governancePortal.loadData();
	}, [governancePortal]);

	const applyFilter = (filters: any[]) => {
		setFilters(filters);
	};
	const toggleShowDialog = () => {
		setShowGovernanceFilters(!showGovernanceFilters);
	};
	return (
		<LayoutContainer style={{ width: '100vw' }}>
			<Grid container item xs={12} spacing={1}>
				<PageHeaderContainer item xs={12} sm={8}>
					<PageHeader title="Governance Portal" subtitle="Review recent activity from the DAO." />
				</PageHeaderContainer>

				<PageHeaderContainer item xs={6} sm={2}>
					<AddressInfoCard
						title="Timelock Contract"
						address={governancePortal.contractAddress}
						linkAddress={'https://etherscan.io/address/' + governancePortal.contractAddress}
					/>
				</PageHeaderContainer>

				<PageHeaderContainer item xs={6} sm={2}>
					<AddressInfoCard
						title="Proposals"
						address={'Snapshot'}
						linkAddress={'https://snapshot.org/#/badgerdao.eth'}
					/>
				</PageHeaderContainer>
			</Grid>

			<Grid container justifyContent="flex-end" alignItems="center">
				<IconButton style={{ marginRight: '2vw' }} onClick={toggleShowDialog}>
					<img src="/assets/icons/vault-filters.svg" alt="vault filters" />
				</IconButton>
			</Grid>

			<GovernanceFilterDialog open={showGovernanceFilters} onClose={toggleShowDialog} applyFilter={applyFilter} />

			<EventsTable events={governancePortal.timelockEvents} filters={filters} />
		</LayoutContainer>
	);
});

export default GovernancePortal;
