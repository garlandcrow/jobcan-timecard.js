require('dotenv').config()
const delay = ((x) => x ? parseInt(x) : 3000)(process.env.JOBCAN_DELAY)
const maxRetries = ((x) => x ? parseInt(x) : 5)(process.env.JOBCAN_MAX_RETRIES)
const isDebug = ((x) => x ? ['1', 'true'].indexOf(`${x}`.toLowerCase()) > -1 : false)
  (process.env.JOBCAN_DEBUG)
const calendarURL = process.env.JOBCAN_CALENDAR_URL

module.exports = { delay, maxRetries, isDebug, calendarURL }