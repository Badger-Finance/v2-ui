import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  makeStyles,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';

import { Filters } from '../../mobx/model/governance-timelock/vote-filters';

const useStyles = makeStyles((theme) => ({
  title: {
    padding: '24px 40px 31px 40px',
  },
  content: {
    padding: '0px 40px 31px 40px',
    [theme.breakpoints.down('xs')]: {
      padding: '0px 30px 31px 30px',
    },
  },
  actionButtons: {
    justifyContent: 'flex-end',
    marginTop: theme.spacing(3),
    [theme.breakpoints.down('xs')]: {
      marginTop: theme.spacing(4),
      justifyContent: 'space-between',
    },
  },
  titleText: {
    fontWeight: 700,
    fontSize: 20,
  },
  closeButton: {
    position: 'absolute',
    right: 30,
    top: 16,
  },
  applyFilter: {
    width: 180,
  },
  tokenSelection: {
    marginTop: theme.spacing(1),
  },
  clearButton: {
    padding: 6,
  },
  formControlLabelText: {
    fontWeight: 400,
  },
  checkboxLabel: {
    marginLeft: theme.spacing(1),
  },
  checkboxLabelRoot: {
    display: 'flex',
    alignItems: 'flex-start',
  },
  checkboxRoot: {
    paddingTop: 6,
  },
}));

interface Props {
  open: boolean;
  onClose: () => void;
  applyFilter: (filters: unknown[]) => void;
}

const GovernanceFilterDialog = ({ open, onClose, applyFilter }: Props): JSX.Element => {
  const classes = useStyles();
  const empty = new Set<string>();
  const [filters, setFilters] = useState<Set<string>>(empty);
  const handleFilterSelect = (filterValue: string) => {
    if (filters.has(filterValue)) {
      const newfilters = new Set(filters);
      newfilters.delete(filterValue);
      setFilters(newfilters);
    } else {
      const newfilters = new Set(filters);
      newfilters.add(filterValue);
      setFilters(newfilters);
    }
  };
  const handleSave = () => {
    applyFilter(Array.from(filters.values()));
    onClose();
  };
  const handleClearAll = () => {
    setFilters(empty);
  };
  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open}>
      <DialogTitle disableTypography className={classes.title}>
        <Typography variant="h6" className={classes.titleText}>
          Filters
        </Typography>
        <IconButton aria-label="close vault filters" className={classes.closeButton} onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.content}>
        <Grid container>
          <Grid container>
            <Typography variant="h6" className={classes.titleText}>
              Status
            </Typography>
            <Grid container className={classes.tokenSelection} spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  aria-label={Filters.PROPOSED}
                  classes={{ root: classes.checkboxLabelRoot }}
                  control={
                    <Checkbox
                      classes={{ root: classes.checkboxRoot }}
                      checked={filters.has(Filters.PROPOSED)}
                      onChange={() => handleFilterSelect(Filters.PROPOSED)}
                    />
                  }
                  label={
                    <div className={classes.checkboxLabel}>
                      <Typography variant="body1" className={classes.formControlLabelText}>
                        Proposed
                      </Typography>
                    </div>
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  aria-label={Filters.VETOED}
                  classes={{ root: classes.checkboxLabelRoot }}
                  control={
                    <Checkbox
                      classes={{ root: classes.checkboxRoot }}
                      checked={filters.has(Filters.VETOED)}
                      onChange={() => handleFilterSelect(Filters.VETOED)}
                    />
                  }
                  label={
                    <div className={classes.checkboxLabel}>
                      <Typography variant="body1" className={classes.formControlLabelText}>
                        Vetoed
                      </Typography>
                    </div>
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  aria-label={Filters.EXECUTED}
                  classes={{ root: classes.checkboxLabelRoot }}
                  control={
                    <Checkbox
                      classes={{ root: classes.checkboxRoot }}
                      checked={filters.has(Filters.EXECUTED)}
                      onChange={() => handleFilterSelect(Filters.EXECUTED)}
                    />
                  }
                  label={
                    <div className={classes.checkboxLabel}>
                      <Typography variant="body1" className={classes.formControlLabelText}>
                        Executed
                      </Typography>
                    </div>
                  }
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid container className={classes.actionButtons} spacing={4}>
          <Grid item>
            <Button variant="text" onClick={handleClearAll} color="primary" className={classes.clearButton}>
              Clear All
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={handleSave} color="primary" className={classes.applyFilter}>
              Apply Filters
            </Button>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default observer(GovernanceFilterDialog);
