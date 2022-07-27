const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const { Upload, upload } = require('./util/bucket/Upload')
const { uploadObject } = require('../varial-image-bucket-server/util/bucket/UploadObject')
const { getMediaLibrary } = require('./util/bucket/GetMediaLibrary')
const { deleteImage } = require('./util/bucket/Delete')
const { listBucket } = require('./util/bucket/ListBucket')
const fs = require('fs-extra')
const sharp = require('sharp')
const { downloadImages } = require('./util/bucket/Download')
const app = express()
const port = process.env.PORT ?? 3001

app.use(bodyParser.text({ limit: '3mb', extended: true }))

app.use(cors())

async function initialize() { await downloadImages() }

initialize()

app.get('/', (req, res) => res.send('hello world'))

app.get('/images', async (req, res) => {
  res.status(200).json(getMediaLibrary())
})

async function handleImageQuery(req, res) {
  const { query, params } = req
  const folder = `${__dirname}/public/media/${params.folder ? `${params.folder}` : '_root' }/${params.image}`
  if (Object.keys(query).length === 0) return res.sendFile(`${folder}/base.webp`)

  const { w, h, q, fit, gray, flip, mirror, rotate } = req.query
  let file = ''

  if (w && !isNaN(w) && parseInt(w) > 0) file += `_w${w}`
  if (h && !isNaN(h) && parseInt(h) > 0) file += `_h${h}`
  if (q && !isNaN(q) && parseInt(q) > 0) file += `_q${q}`
  if (gray === 'true') file += `_gray`
  if (flip === 'true') file += '_flip'
  if (mirror === 'true') file += '_flop'
  if (rotate && !isNaN(rotate)) file += `_q${q}`
  if (fit && ['cover', 'contain', 'fill', 'outside', 'inside'].includes(fit)) file += `_fit-${fit}`
  file += '.webp'

  if (file === '.webp') return res.sendFile(`${folder}/base.webp`)


  if (fs.existsSync(`${folder}/${file}`)) {
    console.log('file exists')
    return res.sendFile(`${folder}/${file}`)
  } else {
    console.log('file doesnt exist', `${folder}/${file}`)

    async function createVariant() {
      sharp(`${folder}/base.webp`)
      .webp({ quality: (q && !isNaN(q) && parseInt(q) > 0) ? parseInt(q) : 60  })
      .flip(flip === true ? true : false)
      .resize({
        withoutEnlargement: true,
        width: (w && !isNaN(w) && parseInt(w) > 0) ? parseInt(w) : undefined,
        height: (h && !isNaN(h) && parseInt(h) > 0) ? parseInt(h) : undefined,
        fit: (fit && ['cover', 'contain', 'fill', 'outside', 'inside'].includes(fit)) ? fit : 'cover',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .toFile(`${folder}/${file}`, (err, info) => {
        if (err) return res.sendFile(`${folder}/base.webp`)

        return res.sendFile(`${folder}/${file}`)
      })
    }

    await createVariant()
    
  }
  
  // return res.sendFile(`${folder}/base.webp`)
}

app.get('/images/:image', async (req, res) => {

  // console.log(req.query)

  // return res.sendFile(`${__dirname}/public/media/_root/${req.params.image}/base.webp`)
  await handleImageQuery(req, res)
})

app.get('/images/:folder/:image', async (req, res) => {

  // console.log(req.query)

  // return res.sendFile(`${__dirname}/public/media/${req.params.folder}/${req.params.image}/base.webp`)
  await handleImageQuery(req, res)
})

app.post('/upload', async (req, res) => {
  const { apiKey, name, description, file, subFolder } = JSON.parse(req.body)

  if (apiKey !== process.env.API_KEY) return res.status(401).send({ error_message: 'Unauthorized request' })

  console.log('subfolder', typeof subFolder )

  upload({ name, description, file, subFolder, sizes: [], res })
})

app.delete('/delete', (req, res) => {
  const { apiKey, name, folder } = JSON.parse(req.body)

  if (apiKey !== process.env.API_KEY) return res.status(401).send({ error_message: 'Unauthorized request' })

  deleteImage({ name, folder: folder ? folder : undefined, res })
})

app.listen(port, () => console.log(`Media library running on port ${port}`))