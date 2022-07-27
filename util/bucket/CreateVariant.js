const fs = require('fs-extra')
const sharp = require('sharp')
const { localFolder } = require('./LocalFolder')

async function createVariant({ name, subFolders, width, height, grayscale = false, flip = false, flop = false, rotate = 0, quality = 80, fit = 'cover' }, callback) {
  console.log('SUB FOLDERS', subFolders)
  const baseFile = `${localFolder}${subFolders.length > 0 ? (subFolders.join('/') + '/') : ''}${name}/base.webp`
  // const baseFile = `${localFolder}{subFolder ??}`
  
  sharp(baseFile)
  .toBuffer(async (err, response, info) => {
    if (err) return callback(baseFile)

    let newFileName = ''
    if (width && width !== info.width) newFileName += `_w${width}`
    if (height && height !== info.height) newFileName += `_h${height}`
    if (quality && quality !== 60) newFileName += `_q${quality}`
    if (grayscale) newFileName += '_gray'
    if (flip) newFileName += '_flip'
    if (flop) newFileName += '_flop'
    if (rotate !== 0) newFileName += `_rotate${rotate}`
    if (fit && fit !== 'cover') newFileName += `_fit-${fit}`
    newFileName += '.webp'

    const newFilePath = `${localFolder}${subFolders.length > 0 ? (subFolders.join('/') + '/') : ''}${name}/${newFileName}`

    if (!fs.existsSync(newFilePath)) {
      sharp(baseFile)
      .webp({ quality: quality ?? 60 })
      .grayscale(grayscale)
      .flip(flip)
      .flop(flop)
      .rotate(parseInt(rotate))
      .resize({
        withoutEnlargement: true,
        width: width && width,
        height: height && height,
        fit: fit,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .toFile(newFilePath, (err, info) => {
        if (err) return callback(baseFile)

        return callback(newFilePath)
      })
    }
  })
}


module.exports = { createVariant }
