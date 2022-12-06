import { GovernanceProposal } from '@badger-dao/sdk';
import { makeStyles, TableCell, TableRow } from '@material-ui/core';
import { shortenAddress } from 'utils/componentHelpers';
import { getFormatedDateTime } from 'utils/date';

export interface EventTableProps {
  proposal: GovernanceProposal;
  onProposalClick: (data: GovernanceProposal) => void;
}

const useStyles = makeStyles({
  root: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
  },
});

const EventsTableItem = ({ proposal, onProposalClick }: EventTableProps): JSX.Element => {
  const classes = useStyles();
  return (
    <TableRow className={classes.root} onClick={() => onProposalClick(proposal)}>
      <TableCell scope="row">{proposal?.proposalId && shortenAddress(proposal?.proposalId, 10)}</TableCell>
      <TableCell align="right">{proposal.currentStatus}</TableCell>
      <TableCell align="right">{getFormatedDateTime(new Date(Number(proposal.createdAt) * 1000))}</TableCell>
      <TableCell align="right">{getFormatedDateTime(new Date(Number(proposal.readyTime) * 1000))}</TableCell>
    </TableRow>
  );
};

export default EventsTableItem;
