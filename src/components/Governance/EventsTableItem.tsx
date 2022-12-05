import { GovernanceProposal } from '@badger-dao/sdk';
import { makeStyles, TableCell, TableRow } from '@material-ui/core';

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
      <TableCell component="th" scope="row">
        {new Date(Number(proposal.createdAt) * 1000).toLocaleString()}
      </TableCell>
      <TableCell align="right">{new Date(Number(proposal.readyTime) * 1000).toLocaleString()}</TableCell>
      <TableCell align="right">{proposal.currentStatus}</TableCell>
    </TableRow>
  );
};

export default EventsTableItem;
