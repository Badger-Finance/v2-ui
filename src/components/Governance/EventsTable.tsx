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
import { useContext, useEffect, useState } from 'react';

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
      setShowProposalDetailModal(true);
      setSelectedProposal(proposal);

      // add proposal id to route
      store.router.goTo(routes.governance, {}, { ...store.router.queryParams, proposalId: proposal.proposalId });
    };

    const handleProposalClose = () => {
      setShowProposalDetailModal(false);
      const { proposalId, ...rest }: QueryParams = { ...store.router.queryParams };
      // remove proposal id from route
      store.router.goTo(routes.governance, {}, { ...rest });
    };

    return (
      <>
        <TableContainer component={Paper}>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Created At</TableCell>
                <TableCell align="right">Ready At</TableCell>
                <TableCell align="right">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loadingProposals &&
                governanceProposals?.items.map((proposal, i) => (
                  <EventsTableItem onProposalClick={handleProposalClick} proposal={proposal} key={'event-' + i} />
                ))}
              {loadingProposals && (
                <TableRow>
                  <TableCell colSpan={3}>
                    {new Array(5).fill('').map(() => (
                      <Skeleton animation="wave" height={43} />
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
        />
      </>
    );
  },
);

export default EventsTable;
