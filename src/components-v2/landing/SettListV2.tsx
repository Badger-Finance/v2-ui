import React, { useContext } from "react";
import TableHeader from '../../components/Collection/Setts/TableHeader';
import { observer } from "mobx-react-lite";
import { List, makeStyles, Typography } from "@material-ui/core";
import { StoreContext } from "mobx/store-context";
import { Loader } from "components/Loader";
import SettListItem from "components-v2/common/SettListItem";

const useStyles = makeStyles((theme) => ({
	list: {
		width: '100%',
		borderRadius: theme.shape.borderRadius,
		overflow: 'hidden',
		background: `${theme.palette.background.paper}`,
		padding: 0,
		boxShadow: theme.shadows[1],
		marginBottom: theme.spacing(1),
	},
	listItem: {
		padding: 0,
		'&:last-child div': {
			borderBottom: 0,
		},
	},
	before: {
		marginTop: theme.spacing(3),
		width: '100%',
	},
	header: {
		padding: theme.spacing(0, -2, 0, 0),
	},
	hiddenMobile: {
		[theme.breakpoints.down('sm')]: {
			display: 'none',
		},
	},
	chip: {
		marginLeft: theme.spacing(1),
		padding: 0,
	},
	title: {
		padding: theme.spacing(2, 2, 2),
	},
	settListContainer: {
		marginTop: theme.spacing(6),
		marginBottom: theme.spacing(12),
	},
}));

const SettListV2 = observer(() => {
  const classes = useStyles();
	const store = useContext(StoreContext);

	const {
    setts: { settList, priceData },
		uiState: { currency, period },
	} = store;

  const getSettListDisplay = (): JSX.Element => {
    const error = settList === null;
    return (
      <>
        {error ? <Typography variant="h4">There was an issue loading setts. Try refreshing.</Typography> :
          !settList ? <Loader /> : settList.map((sett) => <SettListItem sett={sett} key={sett.name} currency={currency} />)
        }
      </>
    );
  };

  return (
    <>
      <TableHeader 
        title={'All Setts  - '}
        tokenTitle={'Tokens'}
        classes={classes}
        period={period}
      />
			<List className={classes.list}>{getSettListDisplay()}</List>
    </>
  );
});

export default SettListV2;
