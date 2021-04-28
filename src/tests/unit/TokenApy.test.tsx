import React from 'react';
import '@testing-library/jest-dom';
import { customRender, screen } from '../Utils';
import { TokenApy } from '../../components-v2/common/TokenApy';

it('displays loading state', () => {
	customRender(<TokenApy logo="logo" />);
	expect(screen.getAllByRole('loader')).toHaveLength(2);
});

it('displays logo', () => {
	customRender(<TokenApy logo="logo" />);
	expect(screen.getByAltText('APY Token Logo')).toBeInTheDocument();
});

it('displays APY information', () => {
	customRender(<TokenApy logo="logo" apyFromLastDay="25.032%" apyFromLastWeek="18.234%" />);
	expect(screen.getByText('25.032%')).toBeInTheDocument();
	expect(screen.getByText('Sampled from last 24 hrs')).toBeInTheDocument();
	expect(screen.getByText('18.234%')).toBeInTheDocument();
	expect(screen.getByText('Sampled from last week')).toBeInTheDocument();
});
