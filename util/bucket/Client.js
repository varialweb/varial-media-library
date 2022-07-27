require('dotenv/config')

const { S3 } = require('@aws-sdk/client-s3')

const client = new S3({
  endpoint: process.env.BUCKET_URL,
  region: process.env.BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.SPACES_KEY,
    secretAccessKey: process.env.SPACES_SECRET,
  },
})

module.exports = { client }