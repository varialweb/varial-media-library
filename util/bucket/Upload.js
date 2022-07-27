const fs = require('fs-extra')
const sharp = require('sharp')
const { PutObjectCommand } = require('@aws-sdk/client-s3')
const { localFolder } = require('./LocalFolder')
const { client } = require('./Client')

async function upload({ name = '', description = '', file = '', subFolder, sizes = [], res }) {
  let successful = true

  console.log('upload request received')
  console.log('subfolder', subFolder)

  name = name.replace(/\.[^.]*$/, '')

  async function createObject() {
    try {
      if (!file) return res.status(500).send({ error_message: 'Error uploading file', error: 'File is null' })

      const base64Data = Buffer.from(file.replace(/^data:image\/\w+;base64,/, ""), 'base64');
      let path = `${localFolder}${subFolder ? (subFolder + '/') : '_root/'}${name.toLowerCase()}`
      
      if (!fs.existsSync(localFolder + `${subFolder ? (subFolder + '/') : '_root/'}` + name.toLowerCase())) {
        fs.mkdirSync(localFolder + `${subFolder ? (subFolder + '/') : '_root/'}` + name.toLowerCase(),{ recursive : true })
      } 

      sharp(base64Data)
      .webp({ quality: 60 })
      .toBuffer(async (err, result, info) => {
        if (err) {
          successful = false
          console.error(error)
        }

        // console.log('RESULT', result)
        // console.log('INFO', info)
      
        let json = {
          name: name.toLowerCase(),
          description: description,
          width: info.width,
          height: info.height,
        }

          
          
        const response = await client.send(new PutObjectCommand({
          Bucket: process.env.BUCKET_NAME,
          Key: `${subFolder ? (subFolder + '/') : '_root/'}${name.toLowerCase()}/base.webp`,
          // Key: `_root/${name.toLowerCase()}/base.webp`,
          Body: result,
          ContentEncoding: 'buffer',
          ContentType: `image/webp`,
        }))
        // console.log('create s3 webp response', response)

        if (response['$metadata'].httpStatusCode === 200) { console.log('file backed up successfully')} else { console.error('Error backing up webp file')}

        fs.writeFileSync(`${path.toLowerCase()}/base.webp`, result)

        const response2 = await client.send(new PutObjectCommand({
          Bucket: process.env.BUCKET_NAME,
          Key: `${subFolder ? (subFolder + '/') : '_root/'}${name.toLowerCase()}/meta.json`,
          // Key: `_root/${name.toLowerCase()}/base.webp`,
          Body: JSON.stringify(json),
          ContentEncoding: 'utf-9',
          ContentType: `application/json`,
        }))

        if (response2['$metadata'].httpStatusCode === 200) { console.log('meta file backed up successfully')} else { console.error('Error backing up meta json file')}

        fs.writeJSONSync(`${path.toLowerCase()}/meta.json`, json)
        
        res.status(200).json({ image: {
            ...json,
            url: `${process.env.BASE_URL}/images/${subFolder ? (subFolder + '/') : ''}${name.toLowerCase()}`,
        } })
      })

    } catch (error) {
      console.error(error)
    }
  }

  await createObject()
}

module.exports = { upload }