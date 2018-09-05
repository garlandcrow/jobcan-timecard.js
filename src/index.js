const punchTheClock = require('./timecard').punchTheClock
const tempus = require('tempusjs')
require('dotenv').config();

(async () => {
  const { username, password } = getUsernamePassword()
  console.info(`Punching the clock for user "${username}":`);

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
})();

function getUsernamePassword() {
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

  return { username, password }
}

