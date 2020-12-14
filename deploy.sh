yarn build;

aws s3 sync build/ s3://dex.itchiro.com/ --profile itchiro;

# aws cloudfront create-invalidation --distribution-id E2T0SKBSRO9AGX --paths "/";