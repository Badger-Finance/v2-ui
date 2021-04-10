/* eslint-disable react/prop-types */
import React, { FC } from 'react';
import { Grid, makeStyles, Box } from '@material-ui/core';

interface Props {
	tokenBalanceInformation: React.ReactNode;
	tokenList: React.ReactNode;
	tokenAmount: React.ReactNode;
	percentagesGroup: React.ReactNode;
}

const useStyles = makeStyles((theme) => ({
	border: {
		border: '1px solid #5C5C5C',
		borderRadius: 8,
	},
	selectContainer: {
		[theme.breakpoints.only('xs')]: {
			justifyContent: 'space-between',
		},
		[theme.breakpoints.up('lg')]: {
			paddingLeft: '10%',
		},
	},
}));

/**
 * Container that helps displays a list of tokens, token information, an input amount, and percentage options
 * using a styled container
 * @param tokenBalanceInformation information of the balance
 * @param tokenList list of tokens component
 * @param tokenAmount token amount component
 * @param percentagesGroup percentages group component
 * @constructor
 */
export const TokenSelectorWithAmountContainer: FC<Props> = ({
	tokenBalanceInformation,
	tokenList,
	tokenAmount,
	percentagesGroup,
}) => {
	const classes = useStyles();

	return (
		<Grid container>
			<Box clone pb={1}>
				<Grid item xs={12}>
					{tokenBalanceInformation}
				</Grid>
			</Box>
			<Grid item xs={12}>
				<Box clone px={1}>
					<Grid container alignContent="center" alignItems="center" className={classes.border}>
						<Grid item xs={12} sm={8} lg={9}>
							<Grid container alignItems="center" spacing={2} className={classes.selectContainer}>
								<Grid item xs={12} sm>
									{tokenList}
								</Grid>
								<Grid item xs={12} sm>
									{tokenAmount}
								</Grid>
							</Grid>
						</Grid>
						<Grid item xs={12} sm={4} lg={3}>
							<Grid container justify="flex-end">
								{percentagesGroup}
							</Grid>
						</Grid>
					</Grid>
				</Box>
			</Grid>
		</Grid>
	);
};

export default TokenSelectorWithAmountContainer;
