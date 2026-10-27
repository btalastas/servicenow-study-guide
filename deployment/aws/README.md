# Deployed question bank

Created and verified October 5, 2026 in **us-east-1**.

- Table: `ServiceNowQuestionBank`
- Table ARN: `arn:aws:dynamodb:us-east-1:936945932113:table/ServiceNowQuestionBank`
- Primary key: `questionId` (String), no sort key
- Index: `ByModuleDifficulty`; partition key `moduleKey`, sort key `difficultyKey`, both Strings; projection ALL
- Capacity: table 5 read / 5 write; index 5 read / 5 write; provisioned, no auto scaling configured
- Import: 338 questions, zero errors
- Verification: all 338 stored items and attributes match the local bank; table and index ACTIVE
- Private S3 source: `s3://servicenow-question-bank-936945932113-us-east-1/question-bank-import/questions.dynamodb.jsonl`
- S3 encryption: AES256; all four bucket public-access blocks enabled

[Commands performed](commands.md) · [Import request](import-request.json) ·
[Query example](query-example.json) · [Verification result](verification.json)

To query hard Data management questions from the repository root:

```bash
aws dynamodb query \
  --cli-input-json file://deployment/aws/query-example.json \
  --profile local --region us-east-1 --no-cli-pager
```

The command returns questions with answer keys and explanations. In the web app,
query DynamoDB through the backend and return only the learner-facing fields
until answer reveal. Use a dedicated application IAM role with the required table
and index permissions; the local root login used for setup is not an application
credential. No API endpoint or web application was deployed in this task.

The uploaded file remains private in S3 for reproducibility. S3 storage and import
have separate pricing from the DynamoDB provisioned-capacity allowance. Other
account resources can also consume that allowance.
