# yarn build;

# aws s3 rm s3://app.badger.finance/v2 --recursive --profile badger;
# aws s3 sync build/ s3://app.badger.finance/v2 --profile badger;

# aws cloudfront create-invalidation --distribution-id E2UNYNZYG09KU6 --paths "/*" --profile badger; 

# yarn build;

# aws s3 rm s3://app.badger.finance/app --recursive --profile badger;
# aws s3 sync build/ s3://app.badger.finance/app --profile badger;

# aws cloudfront create-invalidation --distribution-id E1QZHDW1R1MSYG --paths "/*" "/setts" "/super-setts" "/hunt" "/stake" --profile badger;
 
yarn build;

aws s3 rm s3://app.badger.finance/staging --recursive;
aws s3 sync build/ s3://app.badger.finance/staging;

aws cloudfront create-invalidation --distribution-id E2VBLS8BHAUB1F --paths "/*" "/setts" "/super-setts" "/hunt" "/stake";