import { GovernanceProposal } from '@badger-dao/sdk';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Link,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Theme,
  Typography,
} from '@material-ui/core';
import { ArrowUpward } from '@material-ui/icons';
import CloseIcon from '@material-ui/icons/Close';
import { StoreContext } from 'mobx/stores/store-context';
import { useContext } from 'react';
import { shortenAddress } from 'utils/componentHelpers';
import { getFormatedDateTime } from 'utils/date';

import ProposalAction from './ProposalAction';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    color: 'rgba(255,255,255,0.6)',
    paddingTop: 0,
    paddingBottom: 30,
  },
  title: {
    padding: 20,
    borderBottom: '1px solid rgba(81, 81, 81, 1)',
  },
  titleText: {
    display: 'flex',
    alignItems: 'center',
    '& img': {
      marginRight: 10,
    },
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
  },
  formField: {
    marginBottom: 10,
  },
  proposalId: {
    paddingLeft: 5,
  },
  linkIcon: {
    display: 'inline-block',
    transform: 'rotate(45deg)',
    color: 'white',
    '& svg': {
      fontSize: 16,
    },
  },
  nested: {
    paddingLeft: theme.spacing(1),
  },
  detailtable: {
    marginTop: 20,
    '& td': {
      border: '0px !important',
      '&:first-child': {
        paddingLeft: '0px !important',
      },
    },
  },
  table: {
    '& td': {
      padding: 8,
      wordBreak: 'break-all',
      '&:first-child': {
        borderLeft: '1px solid rgba(81, 81, 81, 1)',
      },
      '&:last-child': {
        borderRight: '1px solid rgba(81, 81, 81, 1)',
      },
    },
  },
}));

interface ProposalDetailModalTypes {
  open: boolean;
  onModalClose: () => void;
  proposal: GovernanceProposal | null;
}

export default function ProposalDetailModal({ open, onModalClose, proposal }: ProposalDetailModalTypes) {
  const classes = useStyles();
  const { chain } = useContext(StoreContext);

  return (
    <Dialog
      open={open}
      onClose={onModalClose}
      fullWidth
      maxWidth="xl"
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title" className={classes.title}>
        <Box className={classes.titleText}>
          <Grid container>
            <Grid item xs={8}>
              <Box sx={{ display: 'flex' }}>
                <Typography variant="body1" color="primary">
                  Proposal Id :
                </Typography>
                <Typography variant="body1" className={classes.proposalId}>
                  {proposal?.proposalId && shortenAddress(proposal?.proposalId, 6)}
                </Typography>
              </Box>
            </Grid>
            <Grid item>
              <Box sx={{ display: 'flex' }}>
                <Typography variant="body1" color="primary">
                  Status :
                </Typography>
                <Typography variant="body1" className={classes.proposalId}>
                  {proposal?.currentStatus}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
        <IconButton aria-label="close" className={classes.closeButton} onClick={onModalClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent id="alert-dialog-description" className={classes.root}>
        <Box sx={{ marginTop: 15 }}>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Typography variant="body2" color="primary">
                <Link href={chain.config.explorerUrl + '/address/' + proposal?.contractAddr} target="_blank">
                  Ethscan
                </Link>
              </Typography>
            </Grid>
            <Grid item>
              <Link
                className={classes.linkIcon}
                href={chain.config.explorerUrl + '/address/' + proposal?.contractAddr}
                target="_blank"
              >
                <ArrowUpward />
              </Link>
            </Grid>
          </Grid>
        </Box>

        <TableContainer>
          <Table size="small" className={`${classes.table} ${classes.detailtable}`}>
            <TableBody>
              <TableRow>
                <TableCell>
                  <Typography noWrap variant="body2" color="primary">
                    Contract Addr
                  </Typography>
                </TableCell>
                <TableCell>{proposal?.contractAddr}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography noWrap variant="body2" color="primary">
                    Target Addr
                  </Typography>
                </TableCell>
                <TableCell>{proposal?.targetAddr}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography noWrap variant="body2" color="primary">
                    Call Data
                  </Typography>
                </TableCell>
                <TableCell>{proposal?.callData}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography noWrap variant="body2" color="primary">
                    Sender
                  </Typography>
                </TableCell>
                <TableCell>{proposal?.sender}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography noWrap variant="body2" color="primary">
                    Creation Block
                  </Typography>
                </TableCell>
                <TableCell>{proposal?.creationBlock}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography noWrap variant="body2" color="primary">
                    Update Block
                  </Typography>
                </TableCell>
                <TableCell>{proposal?.updateBlock}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <ProposalAction actions={proposal?.statuses || []} label="Statuses" />
        <ProposalAction actions={proposal?.disputes || []} label="Disputes" />
        <ProposalAction actions={proposal?.children || []} label="Children" />

        <Grid container justifyContent="space-between">
          <Grid item xs={6}>
            <Box display="flex" sx={{ marginTop: 10 }}>
              <Typography variant="body2" color="primary">
                Created At :
              </Typography>
              <Typography variant="body2" className={classes.proposalId}>
                {proposal?.createdAt && getFormatedDateTime(new Date(Number(proposal.createdAt) * 1000))}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box display="flex" sx={{ marginTop: 10 }}>
              <Typography variant="body2" color="primary">
                Ready At :
              </Typography>
              <Typography variant="body2" className={classes.proposalId}>
                {proposal?.readyTime && getFormatedDateTime(new Date(Number(proposal.readyTime) * 1000))}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}
