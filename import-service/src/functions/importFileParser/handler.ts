import { middyfy } from "@libs/lambda";
import { s3Client } from "@libs/s3";
const csv = require("csv-parser");

const BUCKET_NAME = "my-products-file-bucket";

const importFileParser: any = async (event) => {
  const promises = event.Records.map((record) => {
    return new Promise(() => {
      const params = { Bucket: BUCKET_NAME, Key: record.s3.object.key };
      const file = s3Client.getObject(params).createReadStream();

      file
        .pipe(csv())
        .on("data", (data) => {
          console.log("LOG: Data row: ", data);
        })
        .on("end", async () => {
          console.log("LOG: Copying the file: ", record.s3.object.key);
          await s3Client
            .copyObject({
              Bucket: BUCKET_NAME,
              CopySource: BUCKET_NAME + "/" + record.s3.object.key,
              Key: record.s3.object.key.replace("uploaded", "parsed"),
            })
            .promise();

          console.log("LOG: Removing the file: ", record.s3.object.key);
          await s3Client
            .deleteObject({
              Bucket: BUCKET_NAME,
              Key: record.s3.object.key,
            })
            .promise();
        });
    });
  });

  return Promise.all(promises);
};

export const main = middyfy(importFileParser);
