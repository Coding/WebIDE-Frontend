import { createConnection } from 'vscode-base-languageclient/lib/connection'
import { BaseLanguageClient } from 'vscode-base-languageclient/lib/base'
import {
  MonacoToProtocolConverter,
  ProtocolToMonacoConverter,
  MonacoCommands,
  MonacoLanguages,
  MonacoWorkspace,
} from 'monaco-languageclient'
import io from 'socket.io-client'
import { lowerCase } from 'lodash'

import config from 'config'
import { documentSelectors } from '../utils/languages'
import initializationOptions from '../utils/initializationOptions'
import synchronize from '../utils/synchronize'

export function createMonacoServices (editor, options) {
  const m2p = new MonacoToProtocolConverter()
  const p2m = new ProtocolToMonacoConverter()
  return {
    commands: new MonacoCommands(editor),
    languages: new MonacoLanguages(p2m, m2p),
    workspace: new MonacoWorkspace(p2m, m2p, options.rootUri),
    window: null
  }
}

export function createLanguageClient (services, connection, language) {
  const currentDocumentSelector = documentSelectors.find(v => v.lang === config.mainLanguage)
  const initializationOption = initializationOptions[language]
  return new BaseLanguageClient({
    name: `[${config.mainLanguage}-langServer]`,
    clientOptions: {
      commands: undefined,
      documentSelector: currentDocumentSelector.selectors,
      synchronize: {
        configurationSection: synchronize[language]
      },
      initializationOptions: {
        ...initializationOption,
        workspaceFolders: [`file://${config._ROOT_URI_}`]
      },
      initializationFailedHandler: (err) => {
        const detail = err instanceof Error ? err.message : ''
      },
      diagnosticCollectionName: language,
    },
    services,
    connectionProvider: {
      get: (errorHandler, closeHandler) =>
        Promise.resolve(createConnection(connection, errorHandler, closeHandler)),
    },
  })
}

const wsUrl = config.wsURL
const firstSlashIdx = wsUrl.indexOf('/', 8)
const [host, serverpath] = firstSlashIdx === -1 ? [wsUrl, ''] : [wsUrl.substring(0, firstSlashIdx), wsUrl.substring(firstSlashIdx)]

export function createWebSocket () {
  const socketOptions = {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 10000,
    path: `${serverpath}/javalsp/${config.spaceKey}`,
    transports: ['websocket'],
    query: {
      ws: config.spaceKey,
      language: lowerCase(config.mainLanguage)
    }
  }
  return io.connect(host, socketOptions)
}
