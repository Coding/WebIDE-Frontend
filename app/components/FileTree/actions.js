/* @flow weak */
import _ from 'lodash'
import { createAction } from 'redux-actions'
import api from '../../backendAPI'
import * as Tab from '../Tab'
import { updateUploadProgress } from '../StatusBar/actions'
export const FILETREE_SELECT_NODE = 'FILETREE_SELECT_NODE'
export const FILETREE_SELECT_NODE_KEY = 'FILETREE_SELECT_NODE_KEY'
export function selectNode (node, multiSelect = false) {
  if (typeof node === 'number') {
    return {
      type: FILETREE_SELECT_NODE_KEY,
      payload: {offset: node}
    }
  }
    return {
      type: FILETREE_SELECT_NODE,
      payload: {node, multiSelect}
    }

}

export function openNode (node, shouldBeFolded = null, deep = false) {
  return (dispatch, getState) => {
    if (node.isDir) {
      if (node.shouldBeUpdated) {
        api.fetchPath(node.path)
          .then(data => dispatch(loadNodeData(data, node)))
          .then(() => dispatch(toggleNodeFold(node, shouldBeFolded, deep)))
      } else {
        dispatch(toggleNodeFold(node, shouldBeFolded, deep))
      }
    } else {
      api.readFile(node.path)
        .then(data => {
          dispatch(Tab.actions.createTab({
            id: _.uniqueId('tab_'),
            type: 'editor',
            title: node.name,
            path: node.path,
            content: {
              body: data.content,
              path: node.path,
              contentType: node.contentType
            }
          }))
        })
    }
  }
}

export const FILETREE_FOLD_NODE = 'FILETREE_FOLD_NODE'
export const toggleNodeFold = createAction(FILETREE_FOLD_NODE,
  (node, shouldBeFolded = null, deep = false) => ({ node, shouldBeFolded, deep })
)

export const FILETREE_REMOVE_NODE = 'FILETREE_REMOVE_NODE'
export const removeNode = createAction(FILETREE_REMOVE_NODE, node => node)

export const FILETREE_LOAD_DATA = 'FILETREE_LOAD_DATA'
export const loadNodeData = createAction(FILETREE_LOAD_DATA, (data, node) => ({ data, node }))

export function initializeFileTree () {
  return (dispatch) => {
    api.fetchPath('/').then(data => dispatch(loadNodeData(data)))
  }
}

const pathToDir = (path) =>
path.split('_')[1] ? path.split('_')[1].split('/').slice(0, -1).join('/') || '/' : path

export const uploadFilesToPath = (files, path) => {
  if (path.split('_')[0] === 'folder') {
    path = path.split('_')[1]
  }
  path = pathToDir(path)
  return (dispatch) => {
    if (!files.length) return
    _(files).forEach(file => {
      api.uploadFile(path, file, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          dispatch(updateUploadProgress(percentCompleted))
          if (percentCompleted === 100) {
            setTimeout(() => {
              dispatch(updateUploadProgress(''))
            }, 3000)
          }
        }
      })
    })
  }
}
