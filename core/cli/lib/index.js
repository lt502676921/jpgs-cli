'use strict'

module.exports = core

const log = require('@jpgs-cli-dev/log')
const semver = require('semver')
const colors = require('colors/safe')
const userHome = require('user-home')
const pathExists = require('path-exists').sync
const path = require('path')
const commander = require('commander')
const init = require('@jpgs-cli-dev/init')
const exec = require('@jpgs-cli-dev/exec')

const pkg = require('../package.json')
const constant = require('./const')

const program = new commander.Command()

async function core() {
  try {
    await prepare()
    registerCommand()
  } catch (e) {
    log.error(e.message)
  }
}

async function prepare() {
  checkPkgVersion()
  checkNodeVersion()
  checkRoot()
  checkUserHome()
  checkEnv()
  await checkGlobalUpdate()
}

function checkPkgVersion() {
  log.info('cli', pkg.version)
  log.success('欢迎使用吉品公社前端研发脚手架 --By Gary Li')
  log.success(`
    ___ ___         .__  .__          
 /   |   \\   ____ |  | |  |   ____  
/    ~    \\_/ __ \\|  | |  |  /  _ \\ 
\\    Y    /\\  ___/|  |_|  |_(  <_> )
 \\___|_  /  \\___  >____/____/\\____/ 
       \\/       \\/                  
  `)
}

function checkNodeVersion() {
  //第一步，获取当前 Node 版本号
  const currentVersion = process.version
  //第二步，比对最低版本号
  const lowestVersion = constant.LOWEST_NODE_VERSION
  if (!semver.gte(currentVersion, lowestVersion)) {
    throw new Error(colors.red(`jpgs-cli 需要安装 v${lowestVersion} 以上版本的 Node.js`))
  }
}

function checkRoot() {
  const rootCheck = require('root-check')
  rootCheck()
}

function checkUserHome() {
  if (!userHome || !pathExists(userHome)) {
    throw new Error(colors.red('当前登录用户主目录不存在！'))
  }
}

function checkEnv() {
  const dotenv = require('dotenv')
  const dotenvPath = path.resolve(userHome, '.env')
  if (pathExists(dotenvPath)) {
    dotenv.config({ path: dotenvPath })
  }
  createDefaultConfig()
}

function createDefaultConfig() {
  const cliConfig = {
    home: userHome,
  }
  if (process.env.CLI_HOME) {
    cliConfig['cliHome'] = path.join(userHome, process.env.CLI_HOME)
  } else {
    cliConfig['cliHome'] = path.join(userHome, constant.DEFAULT_CLI_HOME)
  }
  process.env.CLI_HOME_PATH = cliConfig.cliHome
}

async function checkGlobalUpdate() {
  // 1.获取当前版本号和模块名
  const currentVersion = pkg.version
  const npmName = pkg.name
  // 2.调用npm API，获取所有版本号
  // 3.提取所有版本号，比对哪些版本号大于当前版本号
  // 4.获取最新的版本号，提示用户更新到该版本
  const { getNpmSemverVersion } = require('@jpgs-cli-dev/get-npm-info')
  const lastVersion = await getNpmSemverVersion(currentVersion, npmName)
  if (lastVersion && semver.gt(lastVersion, currentVersion)) {
    log.warn(
      colors.yellow(`请手动更新 ${npmName}，当前版本：${currentVersion}，最新版本：${lastVersion}
            更新命令：npm install -g ${npmName}`)
    )
  }
}

function registerCommand() {
  program
    .name(Object.keys(pkg.bin)[0])
    .usage('<command> [options]')
    .version(pkg.version)
    .option('-d, --debug', '是否开启调试模式', false)
    .option('-tp, --targetPath <targetPath>', '是否指定本地调试文件路径', '')

  program.command('init [projectName]').option('-f, --force', '是否强制初始化项目').action(exec)

  program
    .command('publish')
    .option('--refreshServer', '强制更新远程Git仓库')
    .option('--refreshToken', '强制更新远程仓库token')
    .option('--refreshOwner', '强制更新远程仓库类型')
    .option('--buildCmd <buildCmd>', '构建命令')
    .action(exec)

  // 开启debug模式
  program.on('option:debug', function () {
    if (program.opts().debug) {
      process.env.LOG_LEVEL = 'verbose'
    } else {
      process.env.LOG_LEVEL = 'info'
    }
    log.level = process.env.LOG_LEVEL
  })

  // 指定targetPath
  program.on('option:targetPath', function () {
    process.env.CLI_TARGET_PATH = program.opts().targetPath
  })

  // 对未知命令监听
  program.on('command:*', function (obj) {
    const availableCommands = program.commands.map(cmd => cmd.name())
    console.log(colors.red('未知的命令：' + obj[0]))
    if (availableCommands.length > 0) {
      console.log(colors.red('可用命令：' + availableCommands.join(',')))
    }
  })

  program.parse(process.argv)

  if (program.args && program.args.length < 1) {
    program.outputHelp()
    console.log()
  }
}
