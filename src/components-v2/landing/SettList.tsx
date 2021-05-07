import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core';
import { Vault } from '../../mobx/model';
import SettDialog from '../../components/Collection/Setts/SettDialog';
import SettListView from './SettListView';

const useStyles = makeStyles((theme) => ({
	settListContainer: {
		marginTop: theme.spacing(4),
		marginBottom: theme.spacing(12),
	},
}));

export interface SettListProps {
	experimental: boolean;
}

const SettList = observer((props: SettListProps) => {
	const classes = useStyles();
	const { experimental } = props;

	const [dialogProps, setDialogProps] = useState({ open: false, vault: undefined as any, sett: undefined as any });
	const onOpen = (vault: Vault, sett: any): void => setDialogProps({ vault: vault, open: true, sett: sett });
	const onClose = () => setDialogProps({ ...dialogProps, open: false });

	return (
		<div className={classes.settListContainer}>
			<SettListView experimental={experimental} onOpen={onOpen} />
			<SettDialog dialogProps={dialogProps} onClose={onClose} />
		</div>
	);
});

export default SettList;
