import AddressInfoCard from '../components-v2/governance-portal/AddressInfoCard';
import EventsTable from '../components-v2/governance-portal/EventsTable';
import { Grid } from '@material-ui/core';
import PageHeader from '../components-v2/common/PageHeader';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useContext } from 'react';
import { HeaderContainer, LayoutContainer } from '../components-v2/common/Containers';
import { StoreContext } from '../mobx/store-context';

const GovernancePortal = observer(() => {
	const store = useContext(StoreContext);
	const { governancePortal } = store;

	useEffect(() => {
		governancePortal.loadData();
	});

	return (
		<LayoutContainer>
			<Grid container spacing={1} justify="center">
				<HeaderContainer item xs={12}>
					<PageHeader title="Governance Portal" subtitle="Review recent activity from the DAO." />
				</HeaderContainer>

				<Grid item xs={12} md={4}>
					<AddressInfoCard title="Timelock Contract" address={governancePortal.contractAddress} />
				</Grid>

				<Grid item xs={12} md={4}>
					<AddressInfoCard title="Admin" address={governancePortal.adminAddress} />
				</Grid>

				<Grid item xs={12} md={4}>
					<AddressInfoCard title="Guardian" address={governancePortal.guardianAddress} />
				</Grid>
			</Grid>
			<Grid container justify="center">
				<Grid item xs={12} md={9}>
					<EventsTable events={governancePortal.timelockEvents} />
				</Grid>
			</Grid>
		</LayoutContainer>
	);
});

export default GovernancePortal;
