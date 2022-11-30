import { GovernanceProposal } from '@badger-dao/sdk';
import { TableCell, TableRow } from '@material-ui/core';


export interface EventTableProps {
  proposal: GovernanceProposal;
}

const EventsTableItem = ({ proposal }: EventTableProps): JSX.Element => {

  return (
    <TableRow>
      <TableCell component="th" scope="row">
        {new Date(Number(proposal.createdAt) * 1000).toLocaleString()}
      </TableCell>
      <TableCell align="right">{new Date(Number(proposal.readyTime) * 1000).toLocaleString()}</TableCell>
      <TableCell align="right">{proposal.currentStatus}</TableCell>
    </TableRow>
  );
};

export default EventsTableItem;
