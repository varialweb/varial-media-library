// import { localFolder } from "./LocalFolder";
const fs = require('fs-extra')
const jsonfile = require('jsonfile')
const { localFolder } = require('./LocalFolder')

function getMediaLibrary() {
  let allFiles = []

  function getAllFiles(dir) {
    let files = fs.readdirSync(dir).filter(i => i !== '.DS_Store' && i !== '.gitkeep')

    files.forEach(file => {
      if (fs.statSync(`${dir}/${file}`).isDirectory()) return getAllFiles(`${dir}/${file}`)

      if (file.endsWith('base.webp')) {
        allFiles.push(`${dir}/${file}`.split('//')[1])
      }
    })
  }

  getAllFiles(localFolder)

  const library = [...allFiles].map(file => {
    const paths = file.split('/')

    // console.log('file', file)
    
    const meta = jsonfile.readFileSync(`${localFolder}${file.replace('base.webp', 'meta.json')}`)

    // console.log('meta', meta)
    return {
      ...meta,
      url: `${process.env.BASE_URL}/images/${file.replace('base.webp', '').replace('_root/', '').slice(0, -1)}`,
    }
  })

  return library
}

module.exports = { getMediaLibrary }
