import { BamFile } from '@gmod/bam'

import { openLocation } from '../../util/io'
import BaseAdapter from '../../BaseAdapter'
import BamSlightlyLazyFeature from './BamSlightlyLazyFeature'
import { ObservableCreate } from '../../util/rxjs'

export default class BamAdapter extends BaseAdapter {
  constructor(config) {
    super()
    const { bamLocation } = config

    const indexLocation = config.index.location
    const { indexType } = config.index
    const bamOpts = {
      bamFilehandle: openLocation(bamLocation),
    }

    const indexFile = openLocation(indexLocation)
    if (indexType === 'CSI') {
      bamOpts.csiFilehandle = indexFile
    } else {
      bamOpts.baiFilehandle = indexFile
    }

    this.bam = new BamFile(bamOpts)
  }

  async loadData() {
    if (!this.samHeader) {
      const samHeader = await this.bam.getHeader()
      this.samHeader = {}

      // use the @SQ lines in the header to figure out the
      // mapping between ref ref ID numbers and names
      const idToName = []
      const nameToId = {}
      const sqLines = samHeader.filter(l => l.tag === 'SQ')
      sqLines.forEach((sqLine, refId) => {
        sqLine.data.forEach(item => {
          if (item.tag === 'SN') {
            // this is the ref name
            const refName = item.value
            nameToId[refName] = refId
            idToName[refId] = refName
          }
        })
      })
      if (idToName.length) {
        this.samHeader.idToName = idToName
        this.samHeader.nameToId = nameToId
      }
    }
    return this.samHeader.idToName
  }

  /**
   * Fetch features for a certain region. Use getFeaturesInRegion() if you also
   * want to verify that the store has features for the given assembly and
   * reference sequence before fetching.
   * @param {Region} param
   * @returns {Observable[Feature]} Observable of Feature objects in the region
   */
  getFeatures({ refName, start, end }) {
    return ObservableCreate(async observer => {
      await this.loadData()
      const records = await this.bam.getRecordsForRange(refName, start, end)
      records.forEach(record => {
        observer.next(this.bamRecordToFeature(record))
      })
      observer.complete()
    })
  }

  /**
   * called to provide a hint that data tied to a certain region
   * will not be needed for the forseeable future and can be purged
   * from caches, etc
   */
  freeResources(/* { region } */) {}

  bamRecordToFeature(record) {
    return new BamSlightlyLazyFeature(record, this)
  }

  refIdToName(refId) {
    // use info from the SAM header if possible, but fall back to using
    // the ref name order from when the browser's ref names were loaded
    if (this.samHeader.idToName) {
      return this.samHeader.idToName[refId]
    }
    return undefined
  }
}
