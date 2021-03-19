import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core';
import { StoreContext } from 'mobx/store-context';
import { Vault } from '../../mobx/model';
import SettDialog from '../../components/Collection/Setts/SettDialog';
import SettListDisplay from './SettListDisplay';
import UserListDisplay from './UserListDisplay';

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

const SettList = observer(() => {
	const classes = useStyles();
	const store = useContext(StoreContext);

	const {
		uiState: { hideZeroBal },
		wallet: { connectedAddress },
	} = store;

	const [dialogProps, setDialogProps] = useState({ open: false, vault: undefined as any, sett: undefined as any });
	const onOpen = (vault: Vault, sett: any): void => setDialogProps({ vault: vault, open: true, sett: sett });
	const onClose = () => setDialogProps({ ...dialogProps, open: false });

	return (
		<div className={classes.settListContainer}>
			{hideZeroBal && connectedAddress ?
				<UserListDisplay classes={classes} onOpen={onOpen} /> :
				<SettListDisplay classes={classes} onOpen={onOpen} />
			}
			<SettDialog dialogProps={dialogProps} classes={classes} onClose={onClose} />
		</div>
	);
});

export default SettList;
