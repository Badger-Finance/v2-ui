import BigNumber from 'bignumber.js';
import { makeStyles } from '@material-ui/core/styles';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';

type ComparisonConfig = {
  toCompareValue: BigNumber.Value;
  toBeComparedValue: BigNumber.Value;
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
  const toCompare = new BigNumber(toCompareValue);
  const toBeCompared = new BigNumber(toBeComparedValue);

  if (toCompare.gt(toBeCompared)) return greaterCaseColor;
  if (toCompare.lt(toBeCompared)) return lessCaseColor;

  return defaultColor;
};

export const useAssetInputStyles = (
  currentValue: string,
  toCompare = 0,
): ((props?: any) => ClassNameMap<'assetColor'>) => {
  return makeStyles((theme) => {
    const defaultColor = currentValue ? theme.palette.text.primary : theme.palette.text.secondary;
    const fontColor = getColorFromComparison({
      toCompareValue: currentValue,
      toBeComparedValue: toCompare.toFixed(4),
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
