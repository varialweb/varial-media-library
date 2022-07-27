const fs = require('fs-extra')
const { ListObjectsCommand } = require('@aws-sdk/client-s3')
const { client } = require('./Client')
const { localFolder } = require('./LocalFolder')
const getStream = require('get-stream')

async function downloadImages() {
  const objects = await client.send(new ListObjectsCommand({ Bucket: process.env.BUCKET_NAME }))

  // console.log('objects', objects)

  if (objects['Contents']) {
    objects['Contents'].map(async (object) => {
      if (object['Key'].endsWith('base.webp')) {
        if (!fs.existsSync(localFolder + object['Key'])) {

          client.getObject({ Bucket: process.env.BUCKET_NAME, Key: object['Key'] }, async (error, response) => {
            if (error) return console.error(error) 
            
            const contents = await getStream.buffer(response.Body).catch(error => console.error(error))
  
            fs.mkdir(localFolder + object['Key'].replace('/base.webp', ''), { recursive: true }, err => {
              if (err) return console.error('!Error!', err)

              fs.writeFile(localFolder + object['Key'], contents, err => { 
                if (err) return console.error(err)
              })

              client.getObject({ Bucket: process.env.BUCKET_NAME, Key: object['Key'].replace('base.webp', 'meta.json')}, async (err, res) => {
                if (err) return console.error(err)

                const contents = await getStream.buffer(res.Body).catch(error => console.error(error))

                fs.writeFile(localFolder + object['Key'].replace('base.webp', 'meta.json'), contents, err => err && console.error(err))
              })
            })
          })
  
        }
      }
    })
  }
  
}

module.exports = { downloadImages }