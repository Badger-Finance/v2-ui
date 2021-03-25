import React, { FC, useContext } from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import {
	Box,
	Chip,
	Grid,
	IconButton,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableRow,
	TableContainer,
	TableHead,
	Tooltip,
	Typography,
} from '@material-ui/core';
import { InfoOutlined as InfoOutlinedIcon, UnfoldMoreTwoTone } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';

import { StoreContext } from 'mobx/store-context';
import {
        ClawStore,
        SponsorData,
        SyntheticData,
        Liquidation,
} from 'mobx/stores/clawStore';

export const useMainStyles = makeStyles((theme) => ({
	table: {
		minWidth: 650,
	},
	tableRow: {
		cursor: 'pointer',
		'&:last-child td, &:last-child th': {
			border: 0,
			borderBottomLeftRadius: 4,
			borderBottomRightRadius: 4,
		},
	},
	tableRowSubdued: {
		'& .MuiTableCell-head': {
			color: theme.palette.text.secondary,
		},
	},
	redChip: {
		backgroundColor: theme.palette.error.main,
		color: 'white',
	},
}));

function createData(
	token: string,
	price: any,
	locked: any,
	liquidated: any,
	initiated: string,
	status: string,
	complete: any,
) {
	return { token, price, locked, liquidated, initiated, status, complete };
}
const rows = [
	createData('eCLAW FEB29', 1000, 0.013, 0.012, 'February 29, 2021', 'Validating', null),
	createData('eCLAW FEB29', 1000, 0.013, 0.012, 'February 29, 2021', 'Invalid', null),
	createData('eCLAW FEB29', 1000, 0.013, 0.012, 'February 29, 2021', 'Complete', 'February 29, 2021'),
];

interface LiquidationRowProps {
        classes: ClassNameMap;
        store: ClawStore
        liquidation: Liquidation;
        synthetic: SyntheticData;
        decimals: number;
};

const LiquidationRow: FC<LiquidationRowProps> = ({
        store,
        liquidation,
        synthetic,
        classes,
        decimals,
} : LiquidationRowProps) => {
        return (
                <TableRow hover={true} key={synthetic.name} className={classes.tableRow}/>
        );
        // TODO: Hook up liquidation info.
        //return (
        //        <TableRow hover={true} key={synthetic.name} className={classes.tableRow}>
        //                <TableCell>
        //                        <Typography variant="body1">{row.token}</Typography>
        //                </TableCell>
        //                <TableCell>{row.price}</TableCell>
        //                <TableCell>
        //                        <Grid container alignItems="center">
        //                                <Grid item style={{ marginRight: '0.25rem' }}>
        //                                        <Typography variant="body2">{row.locked}</Typography>
        //                                </Grid>
        //                                <Grid item>
        //                                        <Typography variant="body2" color={'textSecondary'}>
        //                                                / {row.liquidated}
        //                                        </Typography>
        //                                </Grid>
        //                        </Grid>
        //                </TableCell>
        //                <TableCell>{row.initiated}</TableCell>
        //                <TableCell>
        //                        {row.status === 'Complete' ? (
        //                                `${row.status} - ${row.complete}`
        //                        ) : row.status === 'Invalid' ? (
        //                                <Tooltip title="Error details go here.">
        //                                        <Chip
        //                                                color="primary"
        //                                                className={classes.redChip}
        //                                                icon={<InfoOutlinedIcon />}
        //                                                label={row.status}
        //                                        />
        //                                </Tooltip>
        //                        ) : (
        //                                <Chip color="primary" label={row.status} />
        //                        )}
        //                </TableCell>
        //                <TableCell align="right">
        //                        <IconButton color="secondary">
        //                                <UnfoldMoreTwoTone />
        //                        </IconButton>
        //                </TableCell>
        //        </TableRow>
        //);
}

const Liquidations: FC = observer(() => {
	const { claw: store, contracts } = useContext(StoreContext);
	const { isLoading, sponsorInformationByEMP, syntheticsData } = store;
	const classes = useMainStyles();
        const sponsorInfo = new Map(Object.entries(toJS(sponsorInformationByEMP)));
        const synthetics = toJS(syntheticsData);
        const rows = [];
        synthetics.forEach((synthetic: SyntheticData) => {
               const { position } = sponsorInfo.get(synthetic.address);
               if (!position) return;
               const bToken = contracts.tokens[synthetic.collateralCurrency.toLocaleLowerCase()]
               const decimals = bToken ? bToken.decimals : 18;
               position.liquidations.forEach((liquidation: Liquidation) => {
                       rows.push(
                               <LiquidationRow
                                       key={synthetic.name}
                                       store={store}
                                       liquidation={liquidation}
                                       synthetic={synthetic}
                                       decimals={decimals}
                                       classes={classes}
                                />
                        );
                })
        })
	return (
		<Box style={{ marginTop: '2rem' }}>
			<Typography variant="h4">Liquidations</Typography>
			<TableContainer component={Paper} style={{ marginTop: '.5rem', padding: '1rem' }}>
				<Table className={classes.table} aria-label="simple table">
					<TableHead>
						<TableRow className={classes.tableRowSubdued}>
							<TableCell component="th" scope="row">
								Token
							</TableCell>
							<TableCell>Price</TableCell>
							<TableCell>Locked / Liquidated</TableCell>
							<TableCell>Initiated</TableCell>
							<TableCell colSpan={2}>Status / Completion</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
					</TableBody>
				</Table>
			</TableContainer>
		</Box>
	);
});

export default Liquidations;
