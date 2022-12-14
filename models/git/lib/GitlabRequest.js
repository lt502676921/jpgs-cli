const axios = require('axios')
const BASE_URL = 'https://ext-git.g-oods.com/api/v4/users'

class GitlabRequest {
  constructor(token) {
    this.token = token
    this.service = axios.create({
      baseURL: BASE_URL,
      timeout: 5000,
    })
    this.service.interceptors.response.use(
      (response) => {
        return response.data
      },
      (error) => {
        if (error.response && error.response.data) {
          return error.response
        } else {
          return Promise.reject(error)
        }
      }
    )
  }

  get(url, params, headers) {
    return this.service({
      url,
      params: {
        ...params,
        access_token: this.token,
      },
      method: 'get',
      headers,
    })
  }
}

module.exports = GitlabRequest
