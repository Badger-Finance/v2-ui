import { Network } from '@badger-dao/sdk';
import { Button, Grid, IconButton } from '@material-ui/core';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import { useContext, useEffect, useState } from 'react';

import { LayoutContainer, PageHeaderContainer } from '../../components-v2/common/Containers';
import PageHeader from '../../components-v2/common/PageHeader';
import AddressInfoCard from './AddressInfoCard';
import EventsTable from './EventsTable';
import GovernanceFilterDialog from './GovernanceFilterDialog';
import ProposalModal from './ProposalModal';

const GovernancePortal = observer(() => {
  const store = useContext(StoreContext);
  const { governancePortal, user, chain } = store;
  const [showGovernanceFilters, setShowGovernanceFilters] = useState(false);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [filters, setFilters] = useState<string[]>([]);
  const [showProposeButton, setShowProposeButton] = useState(false);
  useEffect(() => {
    governancePortal.loadData();
  }, [governancePortal]);

  useEffect(() => {
    async function getProposeRole() {
      const hasRole = await store.user.hasRole();
      console.log({ hasRole });
      setShowProposeButton(hasRole);
    }
    if (chain.network === Network.Arbitrum && user.accountDetails?.address) {
      getProposeRole();
    } else {
      setShowProposeButton(false);
    }
  }, [chain.network, user.accountDetails?.address]);

  //bruh wtf WWHYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY ANY REEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
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

      {showProposeButton && (
        <Grid container justifyContent="flex-end" alignItems="center">
          <Button onClick={() => setShowProposalModal(true)} variant="outlined" color="primary">
            Propose
          </Button>
        </Grid>
      )}

      <ProposalModal
        open={showProposalModal}
        onModalClose={() => {
          setShowProposalModal(!showProposalModal);
        }}
      />
    </LayoutContainer>
  );
});

export default GovernancePortal;
