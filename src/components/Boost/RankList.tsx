import React from 'react';
import { BADGER_RANKS } from './ranks';
import { ButtonBase, Grid, Tooltip } from '@material-ui/core';
import { RankConnector } from './RankConnector';
import { RankLevel } from './RankLevel';

interface Props {
	currentBoost?: string;
	accountBoost?: number;
	onRankJump: (boost: number) => void;
}

export const RankList = ({ currentBoost, accountBoost, onRankJump }: Props): JSX.Element => {
	return (
		<>
			{BADGER_RANKS.slice() //reverse mutates array
				.reverse()
				.map((rank) => {
					// don't display obtained classes on base rank
					const isObtained = accountBoost ? accountBoost > 1 && accountBoost >= rank.boost : false;
					const isLocked = Number(currentBoost) < rank.boost;
					const isCurrentBoost = Number(currentBoost) === rank.boost;

					const rankItem = (
						<Grid container alignItems="flex-end">
							<Grid item>
								<RankConnector
									boost={Number(currentBoost)}
									accountBoost={accountBoost || 1}
									rankBoost={rank.boost}
								/>
							</Grid>
							<Grid item>
								<ButtonBase disabled={isCurrentBoost} onClick={() => onRankJump(rank.boost)}>
									<RankLevel
										key={`${rank.boost}_${rank.name}`}
										name={rank.name}
										boost={rank.boost}
										obtained={isObtained}
										locked={isLocked}
									/>
								</ButtonBase>
							</Grid>
						</Grid>
					);

					if (!isCurrentBoost) {
						return (
							<Tooltip
								title="Jump to rank"
								arrow
								placement="left"
								color="primary"
								key={`${rank.boost}_${rank.name}`}
							>
								{rankItem}
							</Tooltip>
						);
					}

					return rankItem;
				})}
		</>
	);
};
