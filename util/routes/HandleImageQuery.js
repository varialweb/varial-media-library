function handleImageQuery(req, res) {
  const { w, h, q, fit, gray, flip, mirror, rotate } = req.query

  if (Object.keys(req.query).length === 0) {

  }
}

module.exports = { handleImageQuery}