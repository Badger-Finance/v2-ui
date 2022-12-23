import { GovernanceProposal } from '@badger-dao/sdk';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import routes from 'config/routes';
import { GovernancePortalStore } from 'mobx/stores/GovernancePortalStore';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import { QueryParams } from 'mobx-router';
import { useContext, useEffect, useLayoutEffect, useState } from 'react';
import { toast } from 'react-toastify';

import EventsTableItem from './EventsTableItem';
import ProposalDetailModal from './ProposalDetailModal';

export interface EventTableProps {
  governancePortal: GovernancePortalStore;
  nextPage: (val: number) => void;
  loadingProposals: boolean;
  setPerPage: (val: number) => void;
}

const EventsTable = observer(
  ({ governancePortal, nextPage, loadingProposals, setPerPage }: EventTableProps): JSX.Element => {
    const [showProposalDetailModal, setShowProposalDetailModal] = useState(false);
    const [selectedProposal, setSelectedProposal] = useState<GovernanceProposal | null>(null);
    const { governanceProposals } = governancePortal;
    const store = useContext(StoreContext);

    useEffect(() => {
      const { proposalId }: QueryParams = { ...store.router.queryParams };
      if (proposalId) {
        const proposal = governanceProposals?.items.find((proposal) => proposal.proposalId === proposalId);

        if (proposal) {
          setSelectedProposal(proposal);
          setShowProposalDetailModal(true);
        }
      }
    }, [governanceProposals?.items.length]);

    const handleChangePage = (event: unknown, newPage: number) => {
      nextPage(newPage + 1);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
      setPerPage(+event.target.value);
    };

    const handleProposalClick = (proposal: GovernanceProposal) => {
      // add proposal id to route
      store.router.goTo(routes.governance, {}, { ...store.router.queryParams, proposalId: proposal.proposalId });
    };

    const handleProposalClose = () => {
      const { proposalId, ...rest }: QueryParams = { ...store.router.queryParams };
      // remove proposal id from route
      store.router.goTo(routes.governance, {}, { ...rest });
    };

    useLayoutEffect(() => {
      const { proposalId }: QueryParams = { ...store.router.queryParams };
      if (proposalId) {
        const proposal = governanceProposals?.items.find((proposal) => proposal.proposalId === proposalId);
        if (proposal) {
          setShowProposalDetailModal(true);
          setSelectedProposal(proposal);
        }
      } else if (showProposalDetailModal) {
        setShowProposalDetailModal(false);
      }
    }, [store.router.currentPath]);

    const handleVeto = async () => {
      // if (selectedProposal?.proposalId) {
      //   store.governancePortal.veto(selectedProposal?.proposalId, (res, status) => {
      //     if (status === 'success') {
      //       toast.success('Vetoed successfully!');
      //     } else {
      //       toast.error(res?.message || 'Something went wrong!');
      //     }
      //   });
      // }
    };

    const handleUnVeto = () => {
      console.log('HandleUnVeto');
    };

    return (
      <>
        <TableContainer component={Paper}>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Proposal Id</TableCell>
                <TableCell align="right">Status</TableCell>
                <TableCell align="right">Created At</TableCell>
                <TableCell align="right">Ready At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loadingProposals &&
                governanceProposals?.items.map((proposal) => (
                  <EventsTableItem
                    key={proposal.proposalId}
                    onProposalClick={handleProposalClick}
                    proposal={proposal}
                  />
                ))}
              {loadingProposals && (
                <TableRow>
                  <TableCell colSpan={4}>
                    {new Array(5).fill('').map((_, index) => (
                      <Skeleton key={index} animation="wave" height={43} />
                    ))}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 20, 50]}
          component="div"
          count={governanceProposals?.totalItems || 0}
          rowsPerPage={governanceProposals?.perPage || 5}
          page={(governanceProposals?.page || 1) - 1}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />

        <ProposalDetailModal
          proposal={selectedProposal}
          open={showProposalDetailModal}
          onModalClose={handleProposalClose}
          onVeto={handleVeto}
          onUnVeto={handleUnVeto}
          vetoing={store.governancePortal.vetoing}
        />
      </>
    );
  },
);

export default EventsTable;
