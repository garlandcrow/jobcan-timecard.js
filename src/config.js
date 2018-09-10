require('dotenv').config()

var [username, password] = process.argv.slice(2)

username = username || process.env.JOBCAN_USERNAME
if (!username) {
  console.error("You must supply username using env var 'JOBCAN_USERNAME' or as 1st argument.")
  process.exit(1)
}

password = password || process.env.JOBCAN_PASSWORD
if (!password) {
  console.error("You must supply password using env var 'JOBCAN_PASSWORD' or as 2nd argument.")
  process.exit(1)
}

const delay = ((x) => x ? parseInt(x) : 3000)(process.env.JOBCAN_DELAY)
const maxRetries = ((x) => x ? parseInt(x) : 5)(process.env.JOBCAN_MAX_RETRIES)
const isDebug = ((x) => x ? ['1', 'true'].indexOf(`${x}`.toLowerCase()) > -1 : false)
  (process.env.JOBCAN_DEBUG)
const calendarURL = process.env.JOBCAN_CALENDAR_URL

module.exports = {
  username,
  password,
  delay,
  maxRetries,
  isDebug,
  calendarURL
}