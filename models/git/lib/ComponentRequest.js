const axios = require('axios')
const log = require('@jpgs-cli-dev/log')

// const BASE_URL = 'http://60.191.84.109:8082'
const BASE_URL = 'http://localhost:7001'

module.exports = {
  createComponent: async function (component) {
    try {
      const response = await axios.post(`${BASE_URL}/api/v1/components`, component)
      log.verbose('response', response)
      const { data } = response
      if (data.code === 0) {
        return data.data
      }
      return null
    } catch (error) {
      throw error
    }
  },
}
