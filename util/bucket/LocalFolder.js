const localFolder = process.platform === 'win32' ? `${__dirname.replace('\\util\\', '\\').replace('\\bucket', '')}\\public\\media\\` : `${__dirname.replace('/util/', '/').replace('/bucket', '')}/public/media/`

module.exports = { localFolder }