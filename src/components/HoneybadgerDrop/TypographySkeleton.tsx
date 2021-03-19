import React from 'react';
import { Skeleton, SkeletonProps } from '@material-ui/lab';
import { TypographyProps, Typography } from '@material-ui/core';

export const TypographySkeleton: React.FC<Omit<SkeletonProps, 'variant'> & TypographyProps & { loading: boolean }> = ({
	loading,
	children,
	color,
	variant,
	...skeletonOptions
}) => (
	<Typography {...{ color, variant }}>
		{loading ? <Skeleton {...skeletonOptions} style={{ margin: 'auto' }} /> : children}
	</Typography>
);
