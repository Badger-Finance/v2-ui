import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  makeStyles,
  TextField,
  Theme,
  Typography,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import React, { useState } from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    color: 'rgba(255,255,255,0.6)',
    paddingTop: 0,
    paddingBottom: 30,
  },
  title: {
    padding: 20,
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
}));

interface ProposalModalTypes {
  open: boolean;
  onModalClose: () => void;
}

interface ProposalTypes {
  id: number;
  fields: {
    [key: string]: {
      label: string;
      value: string;
      hasError: boolean;
      defaultValue?: string;
    };
  };
}

const ProposalModal = ({ open, onModalClose }: ProposalModalTypes) => {
  const classes = useStyles();

  const [proposals, setProposals] = useState<ProposalTypes[]>([
    {
      id: 1,
      fields: {
        target: {
          label: 'target (address)',
          value: '',
          hasError: false,
        },
        value: {
          label: 'value (uint256)',
          value: '',
          hasError: false,
        },
        data: {
          label: 'data (bytes)',
          value: '',
          hasError: false,
        },
        predecessor: {
          label: 'predecessor (bytes32)',
          value: '0x',
          hasError: false,
          defaultValue: '0x',
        },
        salt: {
          label: 'salt (bytes32)',
          value: '',
          hasError: false,
        },
        delay: {
          label: 'delay (uint256)',
          value: '',
          hasError: false,
        },
      },
    },
  ]);

  const handleFieldValueChange = (value: string, formIndex: number, fieldName: string) => {
    const prevProposals = [...proposals];
    const field = prevProposals[formIndex].fields[fieldName];
    field['value'] = value;
    field['hasError'] = field['value'] ? false : true;
    console.log(prevProposals);
    setProposals(prevProposals);
  };

  const handleAddNewProposal = () => {
    const firstProposal = [...proposals][0];
    setProposals([
      ...proposals,
      {
        id: firstProposal.id + 1,
        fields: Object.fromEntries(
          Object.entries(firstProposal.fields).map((value) => [
            value[0],
            { ...value[1], value: value[1].defaultValue ? value[1].defaultValue : '', hasError: false },
          ]),
        ),
      },
    ]);
  };

  const handleSubmitProposal = () => {
    let hasError = false;
    const prevProposals = [...proposals];
    prevProposals.map((proposal) =>
      Object.keys(proposal.fields).forEach((key) => {
        if (!proposal.fields[key].value) {
          proposal.fields[key].hasError = true;
          hasError = true;
        } else {
          proposal.fields[key].hasError = false;
        }
      }),
    );
    setProposals(prevProposals);
    console.log(prevProposals, hasError);
    if (hasError) return;

    console.log(
      proposals.map((proposal) =>
        Object.fromEntries(Object.keys(proposal.fields).map((key) => [key, proposal.fields[key].value])),
      ),
    );
  };

  const handleFormDelete = (formIndex: number) => {
    const prevProposals = [...proposals];
    prevProposals.splice(formIndex, 1);
    setProposals(prevProposals);
  };

  const handleFormClear = (formIndex: number) => {
    const prevProposals = [...proposals];
    prevProposals[formIndex].fields = Object.fromEntries(
      Object.entries(prevProposals[formIndex].fields).map((value) => [
        value[0],
        { ...value[1], value: value[1].defaultValue ? value[1].defaultValue : '', hasError: false },
      ]),
    );
    setProposals(prevProposals);
  };

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
          <Typography variant="h6" color="primary">
            Create Proposal
          </Typography>
        </Box>
        <IconButton aria-label="close" className={classes.closeButton} onClick={onModalClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent id="alert-dialog-description" className={classes.root}>
        {proposals.map((proposal, index) => (
          <React.Fragment key={proposal.id}>
            <Accordion defaultExpanded={index === proposals.length - 1}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
                <Typography>Proposal {index + 1}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box component={'div'} display="flex" flexDirection={'column'} sx={{ width: '100%' }}>
                  {Object.keys(proposal.fields).map((key) => (
                    <TextField
                      variant="outlined"
                      fullWidth
                      label={proposal.fields[key].label}
                      value={proposal.fields[key].value}
                      onChange={(e) => handleFieldValueChange(e.target.value, index, key)}
                      className={classes.formField}
                      error={proposal.fields[key].hasError}
                    />
                  ))}
                </Box>
              </AccordionDetails>
              <Divider />

              <AccordionActions>
                <Button onClick={() => handleFormClear(index)} size="small">
                  Clear
                </Button>
                {proposals.length > 1 && (
                  <Button onClick={() => handleFormDelete(index)} size="small" color="primary">
                    Delete
                  </Button>
                )}
              </AccordionActions>
            </Accordion>
          </React.Fragment>
        ))}

        <Grid container style={{ marginTop: 20 }}>
          <Grid item xs={6}>
            <Button onClick={handleSubmitProposal} size="small" color="primary">
              Write
            </Button>
          </Grid>
          <Grid xs={6} item justifyContent="flex-end" style={{ display: 'flex' }}>
            <Button onClick={handleAddNewProposal} size="small" color="primary">
              <AddIcon />
            </Button>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default ProposalModal;
