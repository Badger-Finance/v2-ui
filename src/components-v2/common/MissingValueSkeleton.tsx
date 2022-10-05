import { Skeleton } from '@material-ui/lab';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles(() => ({
  skeleton: {
    display: 'inline-flex',
    lineHeight: 1.1,
    marginRight: 5,
  },
}));

const MissingValueSkeleton = ({ className }: { className?: string }) => {
  const classes = useStyles();
  return <Skeleton className={`${classes.skeleton} ${className}`} variant="text" width={30} height={20} />;
};
export default MissingValueSkeleton;
