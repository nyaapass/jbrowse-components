import { Instance, types } from 'mobx-state-tree'

import BaseViewModel from '@jbrowse/core/pluggableElementTypes/models/BaseViewModel'
import { ElementId } from '@jbrowse/core/util/types/mst'
import { parse } from 'clustal-js'
import * as d3 from 'd3'

export default function stateModelFactory() {
  return types.compose(
    BaseViewModel,
    types
      .model('MsaView', {
        id: ElementId,
        type: types.literal('MsaView'),
        height: 600,
        treeWidth: 100,
      })
      .volatile(() => ({
        error: undefined as Error | undefined,
        volatileWidth: 0,
        drawn: false,
        margin: { left: 20, top: 20 },
      }))
      .actions(self => ({
        setError(error?: Error) {
          self.error = error
        },

        setWidth(width: number) {
          self.volatileWidth = width
        },
        setDrawn(flag: boolean) {
          self.drawn = flag
        },
      }))
      .views(self => ({
        get initialized() {
          return self.volatileWidth > 0
        },
        get menuItems() {
          return []
        },
      })),
  )
}

export type MsaViewStateModel = ReturnType<typeof stateModelFactory>
export type MsaViewModel = Instance<MsaViewStateModel>
