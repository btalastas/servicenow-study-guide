# Question bank AWS deployment commands

Executed on October 5, 2026 using profile `local` in `us-east-1`.
The agent uses `/home/bjorn/.local/bin/aws`; the commands below use `aws` for a terminal with PATH configured.

These commands include resource creation; this is an execution record, not a script to rerun blindly.
The import creates a new table. The request includes an idempotency token for this import.

## Local validation and account checks

```bash
python3 scripts/build_question_bank.py --check
aws sts get-caller-identity --profile local --no-cli-pager
aws dynamodb list-tables --profile local --region us-east-1 --no-cli-pager
aws s3api list-buckets --profile local --query 'Buckets[].Name' --no-cli-pager
```

## Create private bucket

```bash
aws s3api create-bucket \
  --bucket servicenow-question-bank-936945932113-us-east-1 \
  --region us-east-1 --profile local --no-cli-pager

aws s3api put-public-access-block \
  --bucket servicenow-question-bank-936945932113-us-east-1 \
  --public-access-block-configuration \
  BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true \
  --region us-east-1 --profile local --no-cli-pager
```

## Upload and import

`import-request.json` is a copy of the provisioned example with the actual bucket
name and an idempotency token. The table and index each receive 5 read and 5 write
capacity units. No auto-scaling policy is configured by this deployment.

```bash
aws s3 cp data/question-bank/questions.dynamodb.jsonl \
  s3://servicenow-question-bank-936945932113-us-east-1/question-bank-import/questions.dynamodb.jsonl \
  --sse AES256 --region us-east-1 --profile local --no-progress

aws dynamodb import-table \
  --cli-input-json file://deployment/aws/import-request.json \
  --region us-east-1 --profile local --no-cli-pager
```

## Monitor import

```bash
aws dynamodb describe-import \
  --import-arn arn:aws:dynamodb:us-east-1:936945932113:table/ServiceNowQuestionBank/import/01791222754359-8bf68697 \
  --query 'ImportTableDescription.{Status:ImportStatus,Imported:ImportedItemCount,Processed:ProcessedItemCount,Errors:ErrorCount,Failure:FailureMessage}' \
  --region us-east-1 --profile local --no-cli-pager
```

## Verify S3 object and public-access settings

```bash
aws s3api head-object \
  --bucket servicenow-question-bank-936945932113-us-east-1 \
  --key question-bank-import/questions.dynamodb.jsonl \
  --query '{Bytes:ContentLength,Encryption:ServerSideEncryption}' \
  --region us-east-1 --profile local --no-cli-pager

aws s3api get-public-access-block \
  --bucket servicenow-question-bank-936945932113-us-east-1 \
  --region us-east-1 --profile local --no-cli-pager
```

## Verify table and stored content

```bash
aws dynamodb describe-table --table-name ServiceNowQuestionBank \
  --region us-east-1 --profile local --no-cli-pager --output json \
  > deployment/aws/table-description.json

aws dynamodb scan --table-name ServiceNowQuestionBank \
  --consistent-read --page-size 10 \
  --region us-east-1 --profile local --no-cli-pager --output json \
  > /tmp/servicenow-question-bank-readback.json

aws dynamodb query --cli-input-json file://deployment/aws/query-example.json \
  --region us-east-1 --profile local --no-cli-pager --output json \
  > /tmp/servicenow-question-bank-query.json
```

The readback was compared with the local DynamoDB JSONL by questionId, including
every attribute. All 338 records matched. The index query returned exactly the
9 expected hard questions in module 4. This full-table scan is a deployment check,
not the recommended per-request application access pattern.

Final result: import COMPLETED, zero errors, table ACTIVE, index ACTIVE.
See `verification.json` for the source hash and verification summary.
