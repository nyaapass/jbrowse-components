import React from 'react'
import { observer } from 'mobx-react'
import PluginManager from '@jbrowse/core/PluginManager'

export default (pluginManager: PluginManager) => {
  const { jbrequire } = pluginManager

  const DotplotView = observer(({ model }: { model: any }) => {
    return <h1>Hello world</h1>
  })

  return DotplotView
}
