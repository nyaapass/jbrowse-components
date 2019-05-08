import { decorate, observable, values } from 'mobx'
import { readConfObject } from '@gmod/jbrowse-core/configuration'

/**
 * @property {Map} refNameMaps mobx observable map with entries like
 * (track configId => refNameMap) (see `addRefNameMapForTrack` method)
 * @property {Region[]} allRegions mobx observable array of all regions defined
 * in all the assemblies of the root configuration
 */
export default class AssemblyManager {
  constructor(rpcManager, rootConfig) {
    this.rpcManager = rpcManager
    this.refNameMaps = new Map()
    this.allRegions = []
    this.updateAssemblyConfigs(rootConfig)
  }

  updateAssemblyConfigs(rootConfig) {
    this.assemblyConfigs = new Map()
    this.assemblyConfigs.set('root', rootConfig.assemblies)
    if (!this.currentlyActiveAssembly) this.currentlyActiveAssembly = 'root'
    rootConfig.volatile.forEach((conf, confName) => {
      if (!this.assemblyConfigs.get(this.currentlyActiveAssembly).size)
        this.currentlyActiveAssembly = confName
      this.assemblyConfigs.set(confName, conf.assemblies)
    })
    this.loadRegions()
  }

  get activeAssembly() {
    return this.currentlyActiveAssembly
  }

  set activeAssembly(assembly) {
    if (!this.assemblyConfigs.has(assembly))
      throw new Error(`Could not activate non-existent assembly: ${assembly}`)
    this.clear()
    this.currentlyActiveAssembly = assembly
  }

  /**
   * Return an object like { refName1: ['alias1', 'alias2'], refName2:
   * ['alias3', 'alias4'] } that describes the reference names and aliases of
   * the given assembly. Returns empty object if the assembly is not found.
   * @param {string} assemblyName The name of an assembly
   * @returns {Promise<object>} Object like { refName1: ['alias1', 'alias2'],
   * refName2: ['alias3', 'alias4'] }
   */
  async getRefNameAliases(assemblyName) {
    const refNameAliases = {}
    const assemblyConfig = this.assemblyConfigs.get(
      this.currentlyActiveAssembly,
    )
    let assembly = assemblyConfig.get(assemblyName)
    if (!assembly) {
      values(assemblyConfig).forEach(otherAssembly => {
        if (
          (readConfObject(otherAssembly, 'aliases') || []).includes(
            assemblyName,
          )
        )
          assembly = otherAssembly
      })
    }

    if (assembly) {
      // eslint-disable-next-line no-await-in-loop
      const adapterRefNameAliases = await this.rpcManager.call(
        assembly.configId,
        'getRefNameAliases',
        {
          sessionId: assemblyName,
          adapterType: readConfObject(assembly, [
            'refNameAliases',
            'adapter',
            'type',
          ]),
          adapterConfig: readConfObject(assembly.refNameAliases, 'adapter'),
        },
        { timeout: 1000000 },
      )
      adapterRefNameAliases.forEach(alias => {
        refNameAliases[alias.refName] = alias.aliases
      })
    }
    return refNameAliases
  }

  /**
   * Add a map with entries like (refName alias => refName used by this track).
   * This is added to the `refNameMaps` attribute of the object, which is made
   * observable by mobx.
   * @param {trackConf} trackConf Configuration model of a track
   */
  async addRefNameMapForTrack(trackConf) {
    const refNameMap = new Map()

    const assemblyName = readConfObject(trackConf, 'assemblyName')

    if (assemblyName) {
      const refNameAliases = await this.getRefNameAliases(assemblyName)

      const refNames = await this.rpcManager.call(
        readConfObject(trackConf, 'configId'),
        'getRefNames',
        {
          sessionId: assemblyName,
          adapterType: readConfObject(trackConf, ['adapter', 'type']),
          adapterConfig: readConfObject(trackConf, 'adapter'),
        },
        { timeout: 1000000 },
      )
      refNames.forEach(refName => {
        refNameMap.set(refName, refName)
        if (refNameAliases[refName])
          refNameAliases[refName].forEach(refNameAlias => {
            refNameMap.set(refNameAlias, refName)
          })
        else
          Object.keys(refNameAliases).forEach(configRefName => {
            if (refNameAliases[configRefName].includes(refName)) {
              refNameMap.set(configRefName, refName)
              refNameAliases[configRefName].forEach(refNameAlias => {
                refNameMap.set(refNameAlias, refName)
              })
            }
          })
      })
    }

    this.refNameMaps.set(readConfObject(trackConf, 'configId'), refNameMap)
  }

  /**
   * Looks at all the assembly configurations and gets and regions they define,
   * then stores them in the mobx observable `allRegions` attribute
   */
  async loadRegions() {
    const regions = []
    const { rpcManager } = this
    const assemblyConfig = this.assemblyConfigs.get(
      this.currentlyActiveAssembly,
    )
    for (const [assemblyName, assembly] of assemblyConfig) {
      const adapterConfig = readConfObject(assembly.sequence, 'adapter')
      try {
        // eslint-disable-next-line no-await-in-loop
        const adapterRegions = await rpcManager.call(
          assembly.configId,
          'getRegions',
          {
            sessionId: assemblyName,
            adapterType: adapterConfig.type,
            adapterConfig,
          },
          { timeout: 1000000 },
        )
        regions.push(...adapterRegions)
      } catch (error) {
        console.error('Failed to fetch sequence', error)
      }
    }
    this.allRegions = regions
  }

  /**
   * Retrieve the stored refNameMap for a track, or if none is found, start the
   * asynchronous method for adding a refNameMap for that track and return an
   * empty map.
   * @param {trackConf} trackConf Configuration model of a track
   * @returns {Map} See `addRefNameMapForTrack` for example Map, or an empty
   * map if the track is not found.
   */
  getRefNameMapForTrack(trackConf) {
    const configId = readConfObject(trackConf, 'configId')
    if (this.refNameMaps.has(configId)) return this.refNameMaps.get(configId)
    this.addRefNameMapForTrack(trackConf)
    return null
  }

  /**
   * Clear all stored refNameMaps
   */
  clear() {
    this.refNameMaps = new Map()
  }
}

decorate(AssemblyManager, {
  allRegions: observable,
  refNameMaps: observable,
})
