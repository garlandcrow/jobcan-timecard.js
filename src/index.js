const punchTheClock = require('./timecard').punchTheClock
const tempus = require('tempusjs')
const isWorkDay = require('./calendar').isWorkDay
const config = require('./config');


(async () => {
  const { username, password } = config

  if (false == await isWorkDay()) {
    console.log(`No work day today, enjoy!`);
    process.exit(0)
  }
  console.log(`Punching the clock for user "${username}":`)

  try {
    const result = await punchTheClock(username, password)
    const now = tempus()
    if (result.success) {
      console.log(
        `Timecard punched @ ${now.format('%H:%M')} on ${now.format('%m/%d/%Y')} - "${
        username}" status changed: ${result.oldStatus} -> ${result.status}`
      )
    }
    else {
      console.log(
        `WARNING: Status did not change after ${
        (result.timeAwaitingStatusChange / 1000).toFixed(1)
        } sec, confirm the change manually or increase the wait time`
      )
    }
  }
  catch (error) {
    console.error(error)
    process.exit(1)
  }
})()
