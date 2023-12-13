const { Upload } = require("@aws-sdk/lib-storage");
const { S3, GetObjectCommand } = require("@aws-sdk/client-s3");
const { AWS_SECRET_KEY, AWS_ACCESS_KEY, S3_BUCKET, AWS_REGION } = process.env;

const s3 = new S3({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY,
  },
});

const that = {};

that.downloadFromS3Url = async (s3Url, res) => {
  try {
    const url = new URL(s3Url);
    const key = decodeURIComponent(url.pathname.substring(1));

    const params = {
      Bucket: S3_BUCKET,
      Key: key,
    };

    console.log(params);

    const command = new GetObjectCommand(params);
    const { Body } = await s3.send(command);

    res.setHeader("Content-Type", "application/pdf");
    // res.setHeader(
    //   "Content-Disposition",
    //   `attachment; filename="${key[key.length - 1]}"`
    // );

    Body.pipe(res);
  } catch (err) {
    throw err;
  }
};

that.uploadToS3 = async (folderName, fileName, fileContent) => {
  try {
    const filePath = `${folderName}/${fileName}`;

    const params = {
      Bucket: S3_BUCKET,
      Key: filePath,
      Body: fileContent,
    };

    const result = await new Upload({
      client: s3,
      params,
    }).done();
    const fileUrl = result.Location;

    return fileUrl;
  } catch (err) {
    throw err;
  }
};

module.exports = that;
