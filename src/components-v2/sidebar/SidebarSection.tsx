import { Collapse, makeStyles } from '@material-ui/core';
import { StoreContext } from 'mobx/store-context';
import React, { useContext, useState } from 'react';
import SidebarItem, { SidebarItemProps } from './SidebarItem';
import { ExpandMore } from '@material-ui/icons';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
	sidebarSection: {
		cursor: 'pointer',
		fontSize: '14px',
		fontWeight: 400,
	},
	titleSection: {
		display: 'flex',
		alignItems: 'center',
		paddingTop: theme.spacing(0.75),
		paddingBottom: theme.spacing(0.75),
		paddingRight: theme.spacing(1.5),
		'&:hover': {
			background: '#434343',
		},
		paddingLeft: '27px',
	},
	icon: {
		width: '14px',
		height: '14px',
		marginRight: theme.spacing(2),
	},
	collapse: {
		display: 'flex',
		flexDirection: 'column',
	},
	title: {
		flexGrow: 1,
	},
	expand: {
		transform: 'rotate(0deg)',
		pointerEvents: 'none',
		transition: theme.transitions.create('transform', {
			duration: theme.transitions.duration.shortest,
		}),
		display: 'flex',
		alignItems: 'center',
	},
	expandOpen: {
		transform: 'rotate(180deg)',
	},
}));

interface SidebarSectionProps {
	title: string;
	items: SidebarItemProps[];
}

const SidebarSection = observer(({ title, items }: SidebarSectionProps): JSX.Element => {
	const classes = useStyles();
	const store = useContext(StoreContext);
	const { router } = store;
	const [open, setOpen] = useState(false);
	const isActive = items.map((item) => item.route).find((route) => route === router.currentPath) !== undefined;

	function toggleSection() {
		if (!isActive) {
			setOpen(!open);
		}
	}

	return (
		<div className={classes.sidebarSection} onClick={toggleSection}>
			<div className={classes.titleSection}>
				<span className={classes.title}>{title}</span>
				<div className={clsx(classes.expand, (open || isActive) && classes.expandOpen)}>
					<ExpandMore />
				</div>
			</div>
			<Collapse className={classes.collapse} in={open || isActive} unmountOnExit>
				{items.map((props) => {
					const { title, view, route } = props;
					return <SidebarItem key={title} title={title} view={view} route={route} />;
				})}
			</Collapse>
		</div>
	);
});

export default SidebarSection;
