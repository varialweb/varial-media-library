const { ListObjectsCommand } = require("@aws-sdk/client-s3")
const { client } = require("./Client")

async function listBucket() {
  const images = await client.send(new ListObjectsCommand({ Bucket: process.env.BUCKET_NAME }))

  console.log('images', images)
}

module.exports = { listBucket }