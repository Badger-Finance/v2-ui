yarn build;

aws s3 rm s3://app.badger.finance/v2 --recursive --profile badger;
aws s3 sync build/ s3://app.badger.finance/v2 --profile badger;

aws cloudfront create-invalidation --distribution-id E2UNYNZYG09KU6 --paths "/*" --profile badger; 
