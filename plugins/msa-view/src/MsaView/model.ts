import { Instance, types } from 'mobx-state-tree'

import BaseViewModel from '@jbrowse/core/pluggableElementTypes/models/BaseViewModel'
import { BaseTrackStateModel } from '@jbrowse/core/pluggableElementTypes/models'
import { getSession, isSessionModelWithWidgets } from '@jbrowse/core/util'
import PluginManager from '@jbrowse/core/PluginManager'
import { ElementId } from '@jbrowse/core/util/types/mst'

export default function stateModelFactory(pluginManager: PluginManager) {
  return types.compose(
    BaseViewModel,
    types
      .model('MsaView', {
        id: ElementId,
        type: types.literal('MsaView'),
        height: 600,
        tracks: types.array(
          pluginManager.pluggableMstType(
            'track',
            'stateModel',
          ) as BaseTrackStateModel,
        ),
      })
      .volatile(() => ({
        volatileWidth: undefined as number | undefined,
        error: undefined as Error | undefined,
        borderX: 100,
        borderY: 100,
      }))
      .views(self => ({
        get menuItems() {
          const session = getSession(self)
          if (isSessionModelWithWidgets(session)) {
            return [
              {
                label: 'Open track selector',
                onClick: () => {},
                disabled:
                  session.visibleWidget &&
                  session.visibleWidget.id === 'hierarchicalTrackSelector' &&
                  // @ts-ignore
                  session.visibleWidget.view.id === self.id,
              },
            ]
          }
          return []
        },
      })),
  )
}

export type MsaViewStateModel = ReturnType<typeof stateModelFactory>
export type MsaViewModel = Instance<MsaViewStateModel>
