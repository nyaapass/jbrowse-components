import { Instance, types } from 'mobx-state-tree'

import BaseViewModel from '@jbrowse/core/pluggableElementTypes/models/BaseViewModel'
import PluginManager from '@jbrowse/core/PluginManager'
import { ElementId } from '@jbrowse/core/util/types/mst'
import { parse } from 'clustal-js'
import * as d3 from 'd3'
import parseNewick from './parseNewick'

const temptree =
  '(((UniProt/Swiss-Prot|P26898|IL2RA_SHEEP:0.24036,(UniProt/Swiss-Prot|P41690|IL2RA_FELCA:0.17737,(UniProt/Swiss-Prot|P01589|IL2RA_HUMAN:0.03906,UniProt/Swiss-Prot|Q5MNY4|IL2RA_MACMU:0.03787):0.13033):0.04964):0.02189,UniProt/Swiss-Prot|P01590|IL2RA_MOUSE:0.23072):0.06814,(((UniProt/Swiss-Prot|Q95118|IL2RG_BOVIN:0.09600,UniProt/Swiss-Prot|P40321|IL2RG_CANFA:0.09845):0.25333,UniProt/Swiss-Prot|Q29416|IL2_CANFA:-0.35055):0.10231,(UniProt/Swiss-Prot|P26896|IL2RB_RAT:0.33631,UniProt/Swiss-Prot|Q7JFM4|IL2_AOTVO:-0.33631):0.10166):0.01607,(UniProt/Swiss-Prot|Q8BZM1|GLMN_MOUSE:0.32378,UniProt/Swiss-Prot|P36835|IL2_CAPHI:-0.32378):0.09999)'

const temptreeSeq = `CLUSTAL O(1.2.3) multiple sequence alignment
UniProt/Swiss-Prot|P26898|IL2RA_SHEEP      MEPSLLMWRFFVFIVVPGCVTEACHDDPPSLRNA----------MFKVLRYE----VGTM
UniProt/Swiss-Prot|P01590|IL2RA_MOUSE      MEPRLLMLGFLSLTIVPSCRAELCLYDPPEVPNA----------TFKALSYK----NGTI
UniProt/Swiss-Prot|P41690|IL2RA_FELCA      MEPSLLLWGILTFVVVHGHVTELCDENPPDIQHA----------TFKALTYK----TGTM
UniProt/Swiss-Prot|P01589|IL2RA_HUMAN      MDSYLLMWGLLTFIMVPGCQAELCDDDPPEIPHA----------TFKAMAYK----EGTM
UniProt/Swiss-Prot|Q5MNY4|IL2RA_MACMU      MDPYLLMWGLLTFITVPGCQAELCDDDPPKITHA----------TFKAVAYK----EGTM
UniProt/Swiss-Prot|Q95118|IL2RG_BOVIN      -----------------------------------LLMWGLLT-----------------
UniProt/Swiss-Prot|P40321|IL2RG_CANFA      MLKPPLPLRSLLFLQLSLLGVGLNSTVPMPNGNEDIT------PDFFLTATPSETLSVSS
UniProt/Swiss-Prot|P26896|IL2RB_RAT        MATVDLSWRLPLYILLLLLATT--------------------------------WVSAAV
UniProt/Swiss-Prot|Q8BZM1|GLMN_MOUSE       PLPLRSLLFLQLPLLGVGLNP------------------PLPLRSLLFLQLPLLGVGLNP
UniProt/Swiss-Prot|P36835|IL2_CAPHI        -----------LLGVGLNPKFLTP------------------------------------
UniProt/Swiss-Prot|Q7JFM4|IL2_AOTVO        MLKPPLPLRSLLFLQLPLLGVGLNPKFLTPSGNEDIGGKPGTGGDFFLTSTPAGTLDVST
UniProt/Swiss-Prot|Q29416|IL2_CANFA        --------------LFLQLSLLG-------------------------------------
`
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
        data: types.optional(types.string, temptreeSeq),
        // todo: make this an object? or adapter?
        treeData: types.optional(types.string, temptree),
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
            .hierarchy(this.newickTree, d => d.branchset)
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
