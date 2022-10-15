import * as AWS from "aws-sdk";
// Set the AWS Region.
const REGION = "eu-west-1"; //e.g. "us-east-1"
// Create an Amazon S3 service client object.
const s3Client = new AWS.S3({
  region: REGION,
  signatureVersion: "v4",
});
export { s3Client };
