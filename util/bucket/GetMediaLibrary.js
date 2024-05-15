// import { localFolder } from "./LocalFolder";
const fs = require('fs-extra')
const jsonfile = require('jsonfile')
const { localFolder } = require('./LocalFolder')

function getMediaLibrary() {
  let allFiles = []

  function getAllFiles(dir) {
    let files = fs.readdirSync(dir).filter(i => i !== '.DS_Store' && i !== '.gitkeep')

    files.forEach(file => {
      // console.log('getallfiles', file)
      if (fs.statSync(`${dir}/${file}`).isDirectory()) return getAllFiles(process.platform === 'win32' ? `${dir}\\${file}` : `${dir}/${file}`)

      if (file.endsWith('base.webp')) {
        let fileName = process.platform === 'win32' ? `${dir}\\${file}`.split('\\\\')[1] : `${dir}/${file}`.split('//')[1]
        console.log('filename', `${dir}\\${file}`.split('\\\\')[1])
        allFiles.push(fileName.replace('\\', '/'))
      }
    })
  }

  getAllFiles(localFolder)

  const library = [...allFiles].map(file => {
    
    console.log('file', file)
    if (!file) return
    // const paths = process.platform === 'win32' ? file.split('\\') : file.split('/')

    
    
    const meta = jsonfile.readFileSync(`${localFolder}${file.replace('base.webp', 'meta.json')}`)

    // console.log('meta', meta)
    return {
      ...meta,
      url: `${process.env.BASE_URL}/images/${file.replace('base.webp', '').replace('_root/', '').slice(0, -1)}`.replace('\\', '/'),
    }
  })

  return library
}

module.exports = { getMediaLibrary }
