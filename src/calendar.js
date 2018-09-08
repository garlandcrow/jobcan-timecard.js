const util = require('util')
const ical = require('ical')
const tempus = require('tempusjs')
const config = require('./config')

const fromURLAsync = util.promisify(ical.fromURL)
const { isDebug, calendarURL } = config

async function isWorkDay() {
  if (!calendarURL) {
    isDebug && console.log(`> DEBUG: No JOBCAN_CALENDAR_URL set.`)
    return false
  }
  isDebug && console.log(`> DEBUG: Got calendar URL: ${calendarURL}`)

  try {
    const calData = await fromURLAsync(calendarURL, {})

    const dateFormat = '%Y-%m-%d'
    const today = tempus().format(dateFormat)

    isDebug && console.log(`> DEBUG: got ${Object.keys(calData).length} events from calendar.`)
    const isWorkDay = Object.keys(calData).some(key => {
      const event = calData[key]
      const eventDate = tempus(event.start).format(dateFormat)
      return eventDate === today
    })
    return isWorkDay
  }
  catch (err) {
    console.error(err)
  }
}

module.exports = { isWorkDay }