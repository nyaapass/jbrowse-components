import Plugin from '@jbrowse/core/Plugin'
import PluginManager from '@jbrowse/core/PluginManager'
import MsaViewFactory from './MsaView'

export default class MsaViewPlugin extends Plugin {
  name = 'MsaViewPlugin'

  install(pluginManager: PluginManager) {
    pluginManager.addViewType(() => pluginManager.jbrequire(MsaViewFactory))
  }
}
