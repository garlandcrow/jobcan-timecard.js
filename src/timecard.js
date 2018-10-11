const puppeteer = require('puppeteer')
const util = require('util')
const setTimeoutAsync = util.promisify(setTimeout)
const config = require('./config')

async function punchTheClock(username, password) {
  const { delay, maxRetries, isDebug } = config

  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  // goto login page
  await page.goto('https://id.jobcan.jp/users/sign_in?app_key=atd&redirect_to=https://ssl.jobcan.jp/jbcoauth/callback')
  isDebug && await page.screenshot({ path: '00_login.png' })

  // enter username and password
  await page.type('#user_email', username)
  const passwordInput = await page.$('#user_password')
  await passwordInput.type(password)
  isDebug && console.log(`\t> DEBUG: entered form data username='${username}', password='${password}'`)
  isDebug && await page.screenshot({ path: '10_data_entered.png' })

  // submit form
  await passwordInput.press('Enter')
  await page.waitForNavigation()
  console.log('\t> logged in user')
  isDebug && await page.screenshot({ path: '20_logged_in.png' })

  let result = {}
  result.oldStatus = await page.evaluate(() => document.getElementById("working_status").innerText)
  console.log(`\t> current working status: ${result.oldStatus}`)

  // punch the clock
  await page.click('#adit-button-push')
  isDebug && await page.screenshot({ path: '30_clock_clicked.png' })

  // keep watching to see if the status changes (it should if it worked)
  var attempt = 1
  result.timeAwaitingStatusChange = 0
  while (attempt <= maxRetries) {
    await setTimeoutAsync(delay)
    result.timeAwaitingStatusChange += delay
    isDebug && await page.screenshot({ path: `4${attempt}_before_attempt_${attempt}.png` })

    result.status = await page.evaluate(() => document.getElementById('working_status').innerText)

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

module.exports = { punchTheClock }
