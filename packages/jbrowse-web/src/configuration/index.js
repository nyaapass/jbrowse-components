import {
  isStateTreeNode,
  getPropertyMembers,
  getSnapshot,
} from 'mobx-state-tree'
import { isObservableArray, isObservableObject } from 'mobx'

import {
  ConfigurationSchema,
  ConfigurationReference,
} from './configurationSchema'

function getModelConfig(tree) {
  // if this is a node
  if (isStateTreeNode(tree)) {
    let config
    if (isObservableObject(tree)) {
      let keys
      //   if it has a 'configuration' view, use that as the node instead
      //   otherwise, just recurse through it normally
      if (tree.configuration) {
        tree = tree.configuration
        keys = Object.keys(tree)
      } else {
        keys = Object.keys(getPropertyMembers(tree).properties)
      }
      config = {}
      keys.forEach(key => {
        config[key] = getModelConfig(tree[key])
      })
    } else if (isObservableArray(tree)) {
      config = tree.map(getModelConfig)
    }

    return config
  }
  return tree
}

function getConf(model, slotName, ...args) {
  const slot = model.configuration[slotName]
  if (!slot) throw new Error(`no slot "${slotName}" found in configuration`)
  if (slot.func) {
    return slot.func.apply(null, args)
  }
  return getSnapshot(slot)
}

export { ConfigurationSchema, ConfigurationReference, getModelConfig, getConf }
