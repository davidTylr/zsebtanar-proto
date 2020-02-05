import { createBrowserHistory } from 'history'
import { History, LocationState } from 'history'

let history

/**
 * Create base history with the specified basename
 *
 * @param basename
 */
export function initHistory(basename: string): History<LocationState> {
  history = createBrowserHistory({
    basename,
    forceRefresh: false,
    getUserConfirmation: (message, callback) => callback(window.confirm(message)),
    keyLength: 6
  })
  return history
}

export default history
