import { middyfy } from "@libs/lambda";
import { S3Event } from "aws-lambda";
import { s3Client } from "@libs/s3";

const csv = require("csv-parser");

const importFileParser = async (event: S3Event) => {
  try {
    const fileRecord = event.Records[0];
    const key = fileRecord.s3.object.key;
    const results = [];

    const response = s3Client
      .getObject({
        Bucket: fileRecord.s3.bucket.name,
        Key: fileRecord.s3.object.key,
      })
      .createReadStream();

    return response
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => {
        console.log("RESULTS", results);

        s3Client
          .copyObject({
            Bucket: fileRecord.s3.bucket.name,
            CopySource: fileRecord.s3.bucket.name + "/" + key,
            Key: key.replace("uploaded", "parsed"),
          })
          .promise()
          .then(() => {
            console.log("LOG: removing the file: ", fileRecord.s3.object.key);
            s3Client
              .deleteObject({
                Bucket: fileRecord.s3.bucket.name,
                Key: fileRecord.s3.object.key,
              })
              .promise();
          });
      });
  } catch (error) {
    console.log('ERROR', error.message);
  }
};

export const main = middyfy(importFileParser);
