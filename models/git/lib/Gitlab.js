const GitServer = require('./GitServer')

class Gitlab extends GitServer {
  constructor() {
    super('gitlab')
  }

  getTokenUrl() {
    return 'https://ext-git.g-oods.com/-/profile/personal_access_tokens'
  }

  getTokenHelpUrl() {
    return ''
  }
}

module.exports = Gitlab
