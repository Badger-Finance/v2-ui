import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { QueryParams, Route } from 'mobx-router';
import { RootStore } from 'mobx/RootStore';
import { StoreContext } from 'mobx/store-context';
import React, { useContext } from 'react';

const useStyles = makeStyles((theme) => ({
	sidebarItem: {
		fontSize: '14px',
		fontWeight: 400,
		display: 'flex',
		alignItems: 'center',
		'&:hover': {
			background: '#434343',
		},
		paddingLeft: '27px',
		paddingTop: theme.spacing(1),
		paddingBottom: theme.spacing(1),
		cursor: 'pointer',
	},
	icon: {
		width: '14px',
		height: '14px',
		marginRight: theme.spacing(2),
	},
	active: {
		background: theme.palette.background.paper,
	},
}));

export interface SidebarItemProps {
	title: string;
	route: string;
	view: Route<RootStore, QueryParams>;
	icon?: string;
	alt?: string;
}

const SidebarItem = observer(({ title, route, view, icon, alt }: SidebarItemProps): JSX.Element => {
	const classes = useStyles();
	const store = useContext(StoreContext);
	const {
		router,
		uiState: { closeSidebar },
	} = store;

	async function visit() {
		closeSidebar();
		await router.goTo(view);
	}

	const isActive = router.currentPath === route;
	return (
		<div onClick={visit} className={clsx(classes.sidebarItem, isActive && classes.active)}>
			{icon && <img className={classes.icon} alt={alt} src={icon} />}
			<span>{title}</span>
		</div>
	);
});

export default SidebarItem;
