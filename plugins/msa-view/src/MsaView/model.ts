import { Instance, types } from 'mobx-state-tree'

import BaseViewModel from '@jbrowse/core/pluggableElementTypes/models/BaseViewModel'
import PluginManager from '@jbrowse/core/PluginManager'
import { ElementId } from '@jbrowse/core/util/types/mst'
import ret, { parse } from 'clustal-js'

console.log({ ret })

export default function stateModelFactory(pluginManager: PluginManager) {
  return types.compose(
    BaseViewModel,
    types
      .model('MsaView', {
        id: ElementId,
        type: types.literal('MsaView'),
        height: 600,
        data: types.maybe(types.string),
      })
      .volatile(() => ({
        error: undefined as Error | undefined,
        volatileWidth: 0,
      }))
      .actions(self => ({
        setError(error?: Error) {
          self.error = error
        },

        setData(text: string) {
          self.data = text
        },
        setWidth(width: number) {
          self.volatileWidth = width
        },
      }))
      .views(self => ({
        get initialized() {
          return self.volatileWidth > 0 && Boolean(self.data)
        },
        get menuItems() {
          return []
        },

        get processedData() {
          return self.data && parse(self.data)
        },
        get width() {
          return self.volatileWidth
        },
      })),
  )
}

export type MsaViewStateModel = ReturnType<typeof stateModelFactory>
export type MsaViewModel = Instance<MsaViewStateModel>
