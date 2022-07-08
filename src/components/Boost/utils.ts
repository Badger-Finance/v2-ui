import { makeStyles } from '@material-ui/core/styles';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import React from 'react';

type ComparisonConfig = {
  toCompareValue: number;
  toBeComparedValue: number;
  greaterCaseColor: string;
  lessCaseColor: string;
  defaultColor: string;
};

export const getColorFromComparison = ({
  toCompareValue,
  toBeComparedValue,
  greaterCaseColor,
  lessCaseColor,
  defaultColor,
}: ComparisonConfig): string => {
  if (toCompareValue > toBeComparedValue) return greaterCaseColor;
  if (toCompareValue < toBeComparedValue) return lessCaseColor;

  return defaultColor;
};

export const useAssetInputStyles = (
  currentValue: string,
  toCompare = 0,
): ((props?: React.CSSProperties) => ClassNameMap<'assetColor'>) => {
  return makeStyles((theme) => {
    const defaultColor = currentValue ? theme.palette.text.primary : theme.palette.text.secondary;
    const fontColor = getColorFromComparison({
      toCompareValue: Number(currentValue),
      toBeComparedValue: toCompare,
      greaterCaseColor: '#74D189',
      lessCaseColor: theme.palette.error.main,
      defaultColor,
    });

    return {
      assetColor: {
        color: fontColor,
      },
    };
  });
};
