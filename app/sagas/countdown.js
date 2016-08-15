import { eventChannel, END } from 'redux-saga'
import Logit from '../factories/logit.js';
var logit = Logit('color:white; background:navy;', 'SyncDoc');

function countdown(secs) {
  return eventChannel(listener => {
      const iv = setInterval(() => {
        logit('tick', secs);
        secs -= 1
        if (secs > 0) {
          logit('put', secs)
          listener(secs)
        } else {
          logit('terminate', secs)
          // this causes the channel to close
          listener(END)
          clearInterval(iv)
        }
      }, 1000);
      // The subscriber must return an unsubscribe function
      return () => {
        clearInterval(iv)
      }
    }
  )
}
import { take, call } from 'redux-saga/effects'

// creates an event Channel from an interval of seconds
export default function* saga() {
  const chan = yield call(countdown, 20)
  try {
    while (true) { // eslint-disable-line no-constant-condition
      // take(END) will cause the saga to terminate by jumping to the finally block
      let seconds = yield take(chan)
      logit('take', `countdown: ${seconds}`)
    }
  } finally {
    logit('countdown terminated', '')
  }
}
