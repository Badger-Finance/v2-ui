import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core';

import { Sett } from 'mobx/model';
import SettDialog from 'components/Collection/Setts/SettDialog';
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

	const [open, setOpen] = useState(false);
	const [sett, setSett] = useState<Sett>();

	const handleOpen = (_sett: Sett) => {
		setSett(_sett);
		setOpen(true);
	};

	const handleClose = () => {
		setSett(undefined);
		setOpen(false);
	};

	return (
		<div className={classes.settListContainer}>
			<SettListView experimental={experimental} onOpen={handleOpen} />
			{sett && <SettDialog open={open} sett={sett} onClose={handleClose} />}
		</div>
	);
});

export default SettList;
