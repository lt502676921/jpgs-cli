const request = require('@jpgs-cli-dev/request')

module.exports = function () {
  return request({
    url: '/project/template',
  })
}
