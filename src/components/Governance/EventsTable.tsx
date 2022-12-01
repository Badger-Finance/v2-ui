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
import { GovernancePortalStore } from 'mobx/stores/GovernancePortalStore';
import { observer } from 'mobx-react-lite';

import EventsTableItem from './EventsTableItem';

export interface EventTableProps {
  governancePortal: GovernancePortalStore;
  nextPage: (val: number) => void;
  loadingProposals: boolean;
  setPerPage: (val: number) => void;
}

const EventsTable = observer(
  ({ governancePortal, nextPage, loadingProposals, setPerPage }: EventTableProps): JSX.Element => {
    const { governanceProposals } = governancePortal;
    const handleChangePage = (event: unknown, newPage: number) => {
      nextPage(newPage + 1);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
      setPerPage(+event.target.value);
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
                  <EventsTableItem proposal={proposal} key={'event-' + i} />
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
      </>
    );
  },
);

export default EventsTable;
