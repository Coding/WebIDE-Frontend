/* @flow weak */
import config from '../config'
import { request } from '../utils'
import Client from './websocketClient'

var connectedResolve
export const websocketConnectedPromise = new Promise((rs, rj) => connectedResolve = rs)

export function isWorkspaceExist () {
  return request.get(`/workspaces/${config.spaceKey}`).catch(() => false).then(() => true)
}

export function setupWorkspace () {
  return config.isPlatform ?
    request.post('/workspaces', {spaceKey: config.spaceKey})
  : request.post(`/workspaces/${config.spaceKey}/setup`)
}

export function connectWebsocketClient () {
  return new Promise(function (resolve, reject) {
    Client.connect(function () {
      connectedResolve(this)
      resolve(true)
    })
  })
}

export function getSettings () {
  return request.get(`/workspaces/${config.spaceKey}/settings`).then(({ content={} }) => {
    return JSON.parse(content)
  })
}

// Switch back to old version
export function switchVersion () {
  return request.put('/versions')
  .then((res) => {
    window.location.reload()
  })
}
