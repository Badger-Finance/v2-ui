import { GovernanceProposal, GovernanceProposalAction, GovernanceProposalsDispute, GovernanceProposalsStatus } from '@badger-dao/sdk';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import { Loader } from 'components/Loader';
import useGovRoles from 'hooks/useGovRoles';
import React from 'react';
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
  card: {
    border: '1px solid rgba(81, 81, 81, 1)',
    padding: theme.spacing(0, 1),
    margin: theme.spacing(2, 0),
  },
  cardHeader: {
    padding: theme.spacing(1, 0, 0, 0),
    '& span': {
      fontSize: '16px',
    },
  },
  cardContent: {
    '&:last-child': {
      padding: theme.spacing(1, 0),
    },
  },
}));

export type BodyAsChildrenType = Omit<GovernanceProposal, 'index' | 'predecessor' | 'executed'>;

interface ProposalDetailModalTypes {
  open: boolean;
  onModalClose: () => void;
  proposal: GovernanceProposal | null;
  onVeto: () => void;
  onUnVeto: () => void;
  vetoing: boolean;
}

export type ProposalBodyType = Omit<GovernanceProposal, 'disputes' | 'statuses' | 'children'>;

export default function ProposalDetailModal({
  open,
  onModalClose,
  proposal,
  onVeto,
  onUnVeto,
  vetoing,
}: ProposalDetailModalTypes) {
  const classes = useStyles();
  const { hasVetoRole, hasUnVetoRole } = useGovRoles();

  if (!proposal) return null;

  console.log({ proposal });

  const { disputes, statuses, actions, ...rest } = proposal;
  const { proposalId, createdAt, contractAddr, readyTime, currentStatus, creationBlock, updateBlock } = rest;

  const events: Array<GovernanceProposalsStatus | GovernanceProposalsDispute> = [...disputes, ...statuses];

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

        <TableContainer>
          <Table size="small" className={`${classes.table} ${classes.detailtable}`}>
            <TableBody>
              {actionRow(decamelize('proposalId', ' '), proposalId)}
              {actionRow(decamelize('createdAt', ' '), getFormatedDateTime(new Date(Number(createdAt) * 1000)))}
              {actionRow(decamelize('contractAddr', ' '), contractAddr)}
              {actionRow(decamelize('readyTime', ' '), getFormatedDateTime(new Date(Number(readyTime) * 1000)))}
              {actionRow(decamelize('contractAddr', ' '), contractAddr)}
              {actionRow(decamelize('currentStatus', ' '), currentStatus)}
              {actionRow(decamelize('creationBlock', ' '), creationBlock.toString())}
              {actionRow(decamelize('updateBlock', ' '), updateBlock.toString())}
            </TableBody>
          </Table>
        </TableContainer>

        {actions.length > 0 && (
          <Card className={classes.card} variant="outlined">
            <CardHeader title={'Actions'} className={classes.cardHeader} />
            <CardContent className={classes.cardContent}>
              {actions.length > 0 && <ProposalAction open={false} actions={actions} label="Action" />}
              {events.length > 0 && <ProposalAction open={false} actions={events} label="Events" />}
            </CardContent>
          </Card>
        )}

        {/* {events.length > 0 && (
          <Card className={classes.card} variant="outlined">
            <CardHeader title={'Events'} className={classes.cardHeader} />
            <CardContent className={classes.cardContent}>
              {events.length > 0 && <ProposalAction open={false} actions={events} label="Event" />}
            </CardContent>
          </Card>
        )} */}

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

      <DialogActions>
        {hasVetoRole && (
          <Button
            startIcon={vetoing && <Loader color="inherit" size={20} />}
            disabled={vetoing}
            variant="contained"
            onClick={onVeto}
            color="primary"
          >
            Veto
          </Button>
        )}

        {hasUnVetoRole && (
          <Button variant="contained" onClick={onUnVeto} color="primary">
            Unveto
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
