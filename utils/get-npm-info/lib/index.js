'use strict'

const axios = require('axios')
const urljoin = require('url-join')
const semver = require('semver')

function getNpmInfo(npmName, registry) {
  if (!npmName) return null
  const registryUrl = registry || getDefaultRegistry()
  const npmInfoUrl = urljoin(registryUrl, npmName)
  return axios
    .get(npmInfoUrl)
    .then(r => {
      if (r.status === 200) {
        return r.data
      }
      return null
    })
    .catch(e => Promise.reject(err))
}

function getDefaultRegistry(isOriginal = true) {
  return isOriginal ? 'https://registry.npmjs.org' : 'https://registry.npm.taobao.org'
}

async function getNpmVersions(npmName, registry) {
  const data = await getNpmInfo(npmName, registry)
  if (data) {
    return Object.keys(data.versions)
  } else {
    return []
  }
}

function getSemverVersions(baseVersion, versions) {
  return versions
    .filter(version => semver.satisfies(version, `^${baseVersion}`))
    .sort((a, b) => (semver.gt(b, a) ? 1 : -1))
}

async function getNpmSemverVersion(baseVersion, npmName, registry) {
  const versions = await getNpmVersions(npmName, registry)
  const newVersions = getSemverVersions(baseVersion, versions)
  if (newVersions && newVersions.length > 0) {
    return newVersions[0]
  }
  return null
}

async function getNpmLatestVersion(npmName, registry) {
  let versions = await getNpmVersions(npmName, registry)
  if (versions) {
    return versions.sort((a, b) => (semver.gt(b, a) ? 1 : -1))[0]
  }
}

module.exports = {
  getNpmInfo,
  getNpmVersions,
  getNpmSemverVersion,
  getDefaultRegistry,
  getNpmLatestVersion,
}
