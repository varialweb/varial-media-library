const fs = require('fs-extra')
const { DeleteObjectsCommand, ListObjectsCommand } = require('@aws-sdk/client-s3')
const { client } = require('./Client')
const { localFolder } = require('./LocalFolder')

async function deleteImage({ name, folder, res }) {

  const path = localFolder + (folder ?? '_root') + '/' + name

  if (fs.existsSync(path)) {
    fs.removeSync(path)
  } else {
    console.error('path doesnt exist', path)
  }

  const objects = await client.send(new ListObjectsCommand({ Bucket: process.env.BUCKET_NAME }))

  const keys = objects['Contents'].filter(item => item['Key'].includes(name)).map(item => item['Key'])
  const deleteObjects = keys.map(i => {
    return { Key: i }
  })

  let response = await client.send(new DeleteObjectsCommand({ Bucket: process.env.BUCKET_NAME, Delete: { Objects: deleteObjects }  }))
  
  if (response['$metadata']?.httpStatusCode === 200) res.send({ image: 'deleted' })
}

module.exports = { deleteImage }