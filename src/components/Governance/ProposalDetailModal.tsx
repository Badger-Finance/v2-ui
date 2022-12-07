import { GovernanceProposal, GovernanceProposalsDispute, GovernanceProposalsStatus } from '@badger-dao/sdk';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Theme,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { StoreContext } from 'mobx/stores/store-context';
import React, { useContext } from 'react';
import { decamelize, shortenAddress } from 'utils/componentHelpers';
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
  cardHeader: {
    paddingLeft: 0,
    paddingRight: 0,
  },
  cardContent: {
    padding: 0,
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

  const events: Array<GovernanceProposalsStatus | GovernanceProposalsDispute> = [];
  if (proposal?.disputes.length) {
    events.push(...proposal.disputes);
  }
  if (proposal?.statuses.length) {
    events.push(...proposal.statuses);
  }

  const actionRow = (label: string, value: string | undefined) => (
    <TableRow>
      <TableCell>
        <Typography noWrap variant="body2" color="primary">
          {label}
        </Typography>
      </TableCell>
      <TableCell>{value}</TableCell>
    </TableRow>
  );

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
        {/* <Box sx={{ marginTop: 15 }}>
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
        </Box> */}

        <Card variant="outlined">
          <CardHeader title="Actions" className={classes.cardHeader} />
          <CardContent className={classes.cardContent}>
            <TableContainer>
              <Table size="small" className={`${classes.table} ${classes.detailtable}`}>
                <TableBody>
                  {actionRow('Contract Addr', proposal?.contractAddr)}
                  {actionRow('Target Addr', proposal?.targetAddr)}
                  {actionRow('Call Data', proposal?.callData)}
                  {actionRow('Sender', proposal?.sender)}
                  {actionRow('Creation Block', proposal?.creationBlock)}
                  {actionRow('Update Block', proposal?.updateBlock)}
                </TableBody>
              </Table>
            </TableContainer>
            {proposal?.children && proposal.children.length > 0 && (
              <>
                {proposal?.children &&
                  proposal?.children.map((child, index: number) => (
                    <>
                      <Divider />
                      <TableContainer>
                        <Table size="small" className={`${classes.table} ${classes.detailtable}`}>
                          <TableBody>
                            <React.Fragment key={child.transactionHash + index}>
                              {(Object.keys(child) as Array<keyof typeof child>).map((key) => (
                                <React.Fragment key={key}>{actionRow(decamelize(key, ' '), child[key])}</React.Fragment>
                              ))}
                            </React.Fragment>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </>
                  ))}
              </>
            )}
          </CardContent>
        </Card>

        {events.length > 0 && <ProposalAction actions={events} label="Events" />}

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
