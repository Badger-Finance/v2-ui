import React from 'react';
import { Grid, Button, TextField, Typography } from '@material-ui/core';

export const Slippage = (props: any) => {
        const { values, classes, handleChange, handleSetMaxSlippage } = props;
        return (
                <Grid item xs={12}>
                        <Typography variant="body1" color="textSecondary" style={{ textAlign: 'left' }}>
                                Max slippage (%):
                        </Typography>
                        <div className={classes.row}>
                                <Button
                                        variant="contained"
                                        onClick={handleSetMaxSlippage(.5)}
                                        className={classes.menuItem}
                                >
                                        .5%
                                </Button>
                                <Button
                                        variant="contained"
                                        onClick={handleSetMaxSlippage(1)}
                                        className={classes.menuItem}
                                >
                                        1%
                                </Button>
                                <Button
                                        variant="contained"
                                        onClick={handleSetMaxSlippage(3)}
                                        className={classes.menuItem}
                                >
                                        3%
                                </Button>
                                <TextField
                                        variant="outlined"
                                        size="small"
                                        value={values.maxSlippage}
                                        disabled={!!values.connectedAddress === false}
                                        placeholder="0.00"
                                        onChange={handleChange('maxSlippage')}
                                />
                        </div>
                </Grid>
        );
}
