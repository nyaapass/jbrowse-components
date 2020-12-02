import { Instance, types } from 'mobx-state-tree'

import BaseViewModel from '@jbrowse/core/pluggableElementTypes/models/BaseViewModel'
import PluginManager from '@jbrowse/core/PluginManager'
import { ElementId } from '@jbrowse/core/util/types/mst'
import { parse } from 'clustal-js'
import * as d3 from 'd3'
import parseNewick from './parseNewick'

export default function stateModelFactory(pluginManager: PluginManager) {
  return types.compose(
    BaseViewModel,
    types
      .model('MsaView', {
        id: ElementId,
        type: types.literal('MsaView'),
        height: 600,
        treeWidth: 100,
        // todo: make this from adapter
        data: types.maybe(types.string),
        // todo: make this an object? or adapter?
        treeData: types.maybe(types.string),
      })
      .volatile(() => ({
        error: undefined as Error | undefined,
        volatileWidth: 0,
        drawn: false,
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
        setDrawn(flag: boolean) {
          self.drawn = flag
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

        get newickTree() {
          return parseNewick(self.treeData)
        },

        get tree() {
          const cluster = d3
            .cluster()
            .size([self.height / 2, self.treeWidth])
            .separation((a, b) => 1)
          const root = d3
            .hierarchy(self.treeData, d => d.branchset)
            .sum(d => (d.branchset ? 0 : 1))
            .sort(
              (a, b) =>
                a.value - b.value || d3.ascending(a.data.length, b.data.length),
            )

          cluster(root)
          return root
        },

        get nodePositions() {
          return this.tree.leaves().map(d => {
            return { name: d.data.name, x: d.x, y: d.y }
          })
        },
      })),
  )
}

export type MsaViewStateModel = ReturnType<typeof stateModelFactory>
export type MsaViewModel = Instance<MsaViewStateModel>
