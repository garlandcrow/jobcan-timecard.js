const puppeteer = require('puppeteer')
const util = require('util')
const setTimeoutAsync = util.promisify(setTimeout)

async function punchTheClock(username, password) {
  const { delay, maxRetries, isDebug } = getSettings()

  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto('https://ssl.jobcan.jp/login/pc-employee/')

  const sharedLoginButton = 'input[value="ジョブカン共通IDでログイン"]'
  await page.waitForSelector(sharedLoginButton)
  await page.click(sharedLoginButton)
  await page.waitForNavigation()
  isDebug && console.log('\t> DEBUG: redirected to the jobcan shared login page')
  isDebug && await page.screenshot({ path: '00_redirected.png' })

  await page.type('#user_email', username)
  const passwordInput = await page.$('#user_password')
  await passwordInput.type(password)
  isDebug && console.log(`\t> DEBUG: entered form data username='${username}', password='${password}'`)
  isDebug && await page.screenshot({ path: '10_data_entered.png' })

  await passwordInput.press('Enter')
  await page.waitForNavigation()
  console.log('\t> logged in user')
  isDebug && await page.screenshot({ path: '20_logged_in.png' })

  let result = {}
  result.oldStatus = await page.evaluate(() => document.getElementById("working_status").innerText)
  console.log(`\t> current working status: ${result.oldStatus}`)

  await page.click('#adit-button-push')
  isDebug && await page.screenshot({ path: '30_clock_clicked.png' })

  var attempt = 1
  result.timeAwaitingStatusChange = 0
  while (attempt <= maxRetries) {
    await setTimeoutAsync(delay)
    result.timeAwaitingStatusChange += delay
    isDebug && await page.screenshot({ path: `4${attempt}_before_attempt_${attempt}.png` })

    result.status = await page.evaluate(() => document.getElementById("working_status").innerText)

    if (result.status !== result.oldStatus) {
      isDebug && console.log(`\t> DEBUG: working status changed: ${result.oldStatus} -> ${result.status}`)
      break
    }
    isDebug && console.log(`\t> DEBUG: working status still "${result.status}" after ${attempt} attempt`)

    attempt += 1
  }
  isDebug && await page.screenshot({ path: `50_timecard_complete.png` })

  result.success = (result.status !== result.oldStatus)
  console.log('\tcompleted')
  await browser.close()

  return result
}

function getSettings() {
  const delay = ((x) => x ? parseInt(x) : 3000)(process.env.JOBCAN_DELAY)
  const maxRetries = ((x) => x ? parseInt(x) : 5)(process.env.JOBCAN_MAX_RETRIES)
  const isDebug = ((x) => x ? ['1', 'true'].indexOf(`${x}`.toLowerCase()) > -1 : false)
    (process.env.JOBCAN_DEBUG)
  return { delay, maxRetries, isDebug }
}

module.exports = { punchTheClock }
