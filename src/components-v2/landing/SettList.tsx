import React, { useState } from 'react';

import SettDialog from '../../components/Collection/Setts/SettDialog';
import SettListView from './SettListView';
import { Vault } from '../../mobx/model';
import { makeStyles } from '@material-ui/core';
import { observer } from 'mobx-react-lite';

const useStyles = makeStyles((theme) => ({
	settListContainer: {
		marginTop: theme.spacing(6),
		marginBottom: theme.spacing(12),
	},
}));

const SettList = observer(() => {
	const classes = useStyles();

	const [dialogProps, setDialogProps] = useState({ open: false, vault: undefined as any, sett: undefined as any });
	const onOpen = (vault: Vault, sett: any): void => setDialogProps({ vault: vault, open: true, sett: sett });
	const onClose = () => setDialogProps({ ...dialogProps, open: false });

	return (
		<div className={classes.settListContainer}>
			<SettListView onOpen={onOpen} />
			<SettDialog dialogProps={dialogProps} onClose={onClose} />
		</div>
	);
});

export default SettList;
