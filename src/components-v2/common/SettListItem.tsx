import { ListItem, makeStyles, Typography, Grid, Tooltip } from "@material-ui/core";
import { BigNumber } from "bignumber.js";
import { Sett } from "mobx/model";
import { usdToCurrency } from "mobx/utils/helpers";
import React from "react";

const useStyles = makeStyles((theme) => ({
	border: {
		borderBottom: `1px solid ${theme.palette.background.default}`,
		padding: theme.spacing(2, 2),
		alignItems: 'center',
		overflow: 'hidden',
		transition: '.2s background ease-out',
		cursor: 'pointer',
		'&:hover': {
			background: '#3a3a3a',
		},
		'&:active': {
			background: theme.palette.background.default,
		},
	},
	mobileLabel: {
		textAlign: 'right',
		paddingRight: theme.spacing(2),
		[theme.breakpoints.up('md')]: {
			display: 'none',
		},
	},
	name: {
		[theme.breakpoints.down('sm')]: {
			marginBottom: theme.spacing(2),
		},
	},
	chip: {
		marginLeft: theme.spacing(1),
		padding: 0,
	},
	symbol: {
		marginTop: 'auto',
		marginBottom: 'auto',
		padding: theme.spacing(0, 0, 0, 0),
		marginRight: theme.spacing(2),
		display: 'inline-block',
		float: 'left',
		width: '2.4rem',
	},
	listItem: {
		padding: 0,
		'&:last-child div': {
			borderBottom: 0,
		},
	},
}));

interface SettListItemProps {
  sett: Sett;
  currency: string;
};

const SettListItem = (props: SettListItemProps): JSX.Element => {
  const classes = useStyles();
  const { sett, currency } = props;
  const tooltip = getToolTip(sett);

  console.log(`/assets/icons/${sett.asset.toLowerCase()}`);
  return (
    <ListItem className={classes.listItem}>
      {/* TODO: Add back and on click */}
      <Grid container className={classes.border}>
        <Grid item xs={12} md={4} className={classes.name}>
          <img
            alt={`Badger ${sett.name} Vault Symbol`}
            className={classes.symbol}
            src={`/assets/icons/${sett.asset.toLowerCase()}.png`}
          />
          <Typography variant="body1">{sett.name}
            {/* TODO: Refactor this check on v2 (this is bad!) */}
            {/* {sett && sett.position === 8 && (
              <Chip className={classes.chip} label="Harvest" size="small" color="primary" />
            )} */}</Typography>
        </Grid>

        <Grid item className={classes.mobileLabel} xs={6}>
          <Typography variant="body2" color={'textSecondary'}>Tokens Deposited</Typography>
        </Grid>
        <Grid item xs={6} md={2}>
          {/* TODO: Add tokens here */}
        </Grid>

        <Grid item className={classes.mobileLabel} xs={6}>
          <Typography variant="body2" color={'textSecondary'}>
            {'ROI'}
          </Typography>
        </Grid>
        <Grid item xs={6} md={2}>
          <Tooltip enterDelay={0} leaveDelay={300} arrow placement="left" title={tooltip}>
            <Typography style={{ cursor: 'default' }} variant="body1" color={'textPrimary'}>
              {sett.apy.toFixed(2)}%
            </Typography>
          </Tooltip>
        </Grid>
        <Grid item className={classes.mobileLabel} xs={6}>
          <Typography variant="body2" color={'textSecondary'}>
            Value
          </Typography>
        </Grid>
        <Grid item xs={6} md={2}>
          <Typography variant="body1" color={'textPrimary'}>
            {usdToCurrency(new BigNumber(sett.value), currency)}
          </Typography>
        </Grid>
      </Grid>
    </ListItem>
  );
};

const getToolTip = (sett: Sett): string => {
  return sett.sources.map(source => `${source.apy}% ${source.name}`).join(' + ');
};

export default SettListItem;
