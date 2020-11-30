import Plugin from '@jbrowse/core/Plugin'
import PluginManager from '@jbrowse/core/PluginManager'

export default ({ jbrequire }: { jbrequire: Function }) => {
  const ViewType = jbrequire('@jbrowse/core/pluggableElementTypes/ViewType')
  return new ViewType({
    name: 'DotplotView',
    stateModel: jbrequire(modelFactory),
    ReactComponent: jbrequire(ReactComponentFactory),
  })
}

export default class DotplotPlugin extends Plugin {
  name = 'MsaViewPlugin'

  install(pluginManager: PluginManager) {
    pluginManager.addViewType(() => pluginManager.jbrequire(MsaViewFactory))
  }
}
