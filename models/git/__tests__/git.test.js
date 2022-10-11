'use strict'

const fs = require('fs')
require('should')
const Gitee = require('../lib/Gitee')
const Git = require('../lib')
const GiteeRequest = require('../lib/GiteeRequest')

const GIT_TOKEN_PATH = '/Users/oreo/.jpgs-cli-dev/.git/.git_token'

function createGiteeInstance() {
  const token = fs.readFileSync(GIT_TOKEN_PATH).toString()
  const gitee = new Gitee()
  gitee.setToken(token)
  return gitee
}

function createGitInstance({ complexName = false } = {}) {
  return new Git(
    {
      name: complexName ? '@jpgs-cli-dev/temp-add-hm' : 'temp-add-hm',
      version: '0.1.0',
      dir: '/Users/oreo/Desktop/temp-add-hm',
    },
    {}
  )
}

describe('Gitee类实例化', () => {
  it('实例化检查', function () {
    const gitee = new Gitee()
    gitee.setToken('123456')
    gitee.type.should.equal('gitee')
    gitee.token.should.equal('123456')
    gitee.request.should.not.equal(null)
    gitee.request.__proto__.should.equal(GiteeRequest.prototype)
  })
})

describe('Gitee获取个人或组织信息', function () {
  it('获取个人信息', async function () {
    const instance = createGiteeInstance()
    const user = await instance.getUser()
    user.login.should.equal('i-cant-twist-oreo')
  })
  it('获取组织信息', async function () {
    const instance = createGiteeInstance()
    const user = await instance.getUser()
    const org = await instance.getOrg(user.login)
    org.length.should.equal(2)
    org[0].login.should.equal('jpgs-component')
  })
})

describe('Gitee获取仓库信息', function () {
  it('获取指定仓库信息', async function () {
    const instance = createGiteeInstance()
    const user = await instance.getUser()
    const repo = await instance.getRepo(user.login, 'jpgs-cli-dev')
    repo.full_name.should.equal(`${user.login}/jpgs-cli-dev`)
  })
})

describe('Git类测试', function () {
  it('Git类实例化测试', function () {
    const instance = createGitInstance({ complexName: true })
    instance.name.should.equal('jpgs-cli-dev_temp-add-hm')
  })
  it('获取正确的分支号（未上线项目）', async function () {
    this.timeout(100000)
    const instance = createGitInstance()
    await instance.getCorrectVersion()
    instance.version.should.equal('0.1.0')
  })
})
