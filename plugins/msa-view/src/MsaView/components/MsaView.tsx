import React, { useEffect, useRef } from 'react'
import { observer } from 'mobx-react'
import PluginManager from '@jbrowse/core/PluginManager'

import * as d3 from 'd3'
import ImportForm from './ImportForm'
import { MsaViewModel } from '../model'

// import colorSchemes from './colorSchemes'

// const defaultColorScheme = 'maeditor'

// function TreeCanvas({
//   width,
//   height,
//   nodes,
//   branchStrokeStyle,
//   treeStrokeWidth = 1,
//   ancestorCollapsed,
//   rowConnectorDash = [2, 2],
//   nodeChildren,
//   rowHeight = 24,
//   nodeHandleRadius = 4,
//   collapsed,
//   collapsedNodeHandleFillStyle = 'white',
//   nodeHandleFillStyle = 'black',
//   nodeClicked = () => {},
//   nx,
//   ny,
// }) {
//   const treeCanvas = useRef()

//   const nodesWithHandles = nodes.filter(
//     node => !ancestorCollapsed[node] && nodeChildren[node].length,
//   )

//   const makeNodeHandlePath = useCallback(
//     (node, ctx) => {
//       ctx.beginPath()
//       ctx.arc(nx[node], ny[node], nodeHandleRadius, 0, 2 * Math.PI)
//     },
//     [nodeHandleRadius, nx, ny],
//   )

//   // useEffect+useRef is a conventional way to draw to
//   // canvas using React. the ref is a "reference to the canvas DOM element"
//   // and the useEffect makes sure to update it when the ref changes and/or
//   // the props that are relevant to all the drawing code within here change
//   useEffect(() => {
//     if (treeCanvas.current) {
//       const ctx = treeCanvas.current.getContext('2d')
//       ctx.strokeStyle = branchStrokeStyle
//       ctx.lineWidth = treeStrokeWidth
//       nodes.forEach(node => {
//         if (!ancestorCollapsed[node]) {
//           if (!nodeChildren[node].length) {
//             ctx.setLineDash([])
//             ctx.beginPath()
//             ctx.fillRect(
//               nx[node],
//               ny[node] - nodeHandleRadius,
//               1,
//               2 * nodeHandleRadius,
//             )
//           }
//           if (nodeChildren[node].length && !collapsed[node]) {
//             ctx.setLineDash([])
//             nodeChildren[node].forEach(child => {
//               ctx.beginPath()
//               ctx.moveTo(nx[node], ny[node])
//               ctx.lineTo(nx[node], ny[child])
//               ctx.lineTo(nx[child], ny[child])
//               ctx.stroke()
//             })
//           } else {
//             ctx.setLineDash(rowConnectorDash)
//             ctx.beginPath()
//             ctx.moveTo(nx[node], ny[node])
//             ctx.lineTo(width, ny[node])
//             ctx.stroke()
//           }
//         }
//       })
//       nodesWithHandles.forEach(node => {
//         makeNodeHandlePath(node, ctx)
//         if (collapsed[node]) {
//           ctx.fillStyle = collapsedNodeHandleFillStyle
//         } else {
//           ctx.fillStyle = nodeHandleFillStyle
//           ctx.stroke()
//         }
//         ctx.fill()
//       })
//     }
//   }, [
//     ancestorCollapsed,
//     branchStrokeStyle,
//     treeStrokeWidth,
//     rowConnectorDash,
//     nx,
//     ny,
//     nodes,
//     nodeHandleRadius,
//     nodeChildren,
//     collapsed,
//     nodesWithHandles,
//     collapsedNodeHandleFillStyle,
//     nodeHandleFillStyle,
//     makeNodeHandlePath,
//     width,
//   ])

//   return (
//     <canvas
//       ref={treeCanvas}
//       onClick={evt => {
//         const { clientX, clientY } = evt
//         const mouseX = clientX - treeCanvas.current.getBoundingClientRect().left
//         const mouseY = clientY - treeCanvas.current.getBoundingClientRect().top
//         const ctx = treeCanvas.current.getContext('2d')
//         let clickedNode = null
//         nodesWithHandles.forEach(node => {
//           makeNodeHandlePath(node, ctx)
//           if (ctx.isPointInPath(mouseX, mouseY)) {
//             clickedNode = node
//           }
//         })
//         if (clickedNode && nodeClicked) {
//           nodeClicked(clickedNode)
//         }
//       }}
//       width={width}
//       height={height}
//       style={{ width, height }}
//     />
//   )
// }

// function SpeciesNames({
//   nodes,
//   ancestorCollapsed,
//   rowHeights,
//   rowData,
//   colorScheme,
// }) {
//   return (
//     <div>
//       {nodes.map(node => {
//         return (
//           <div key={node} style={{ height: rowHeights[node] }}>
//             {!ancestorCollapsed[node] && rowData[node] ? (
//               <span>{node}</span>
//             ) : null}
//           </div>
//         )
//       })}
//     </div>
//   )
// }

// function MSARows({
//   nodes,
//   style = {},
//   ancestorCollapsed,
//   rowHeights,
//   rowData,
//   colorScheme,
// }) {
//   const ref = useRef()

//   return (
//     <div ref={ref} style={style}>
//       <div>
//         {nodes.map(node => {
//           return (
//             <div
//               key={node}
//               style={{ height: `${rowHeights[node]}px`, display: 'flex' }}
//             >
//               {!ancestorCollapsed[node] && rowData[node]
//                 ? rowData[node].split('').map((c, i) => {
//                     return (
//                       <span
//                         // eslint-disable-next-line react/no-array-index-key
//                         key={`${c}_${i}`}
//                         style={{
//                           color:
//                             colorScheme[c.toUpperCase()] ||
//                             colorScheme.default ||
//                             'black',
//                         }}
//                       >
//                         {c}
//                       </span>
//                     )
//                   })
//                 : null}
//             </div>
//           )
//         })}
//       </div>
//     </div>
//   )
// }

// function MSA({
//   rowHeight: genericRowHeight = 24,
//   nameFontSize = 12,
//   width: containerWidth = '',
//   height: containerHeight = null,
//   treeWidth = 200,
//   nameWidth = 200,
//   branchStrokeStyle = 'black',
//   nodeHandleRadius = 4,
//   nodeHandleFillStyle = 'white',
//   colorScheme: colorSchemeName = defaultColorScheme,
//   collapsed: initialCollapsed = {},
//   root,
//   branches,
//   rowData,
// }) {
//   const ref = useRef()
//   const [collapsed, setCollapsed] = useState(initialCollapsed)
//   const colorScheme = colorSchemes[colorSchemeName]
//   const treeStrokeWidth = 1
//   const availableTreeWidth = treeWidth - nodeHandleRadius - 2 * treeStrokeWidth
//   const charFontName = 'Menlo,monospace'
//   const scrollbarHeight = 20 // hack

//   return (
//     <div
//       style={{
//         width: containerWidth,
//         height: containerHeight,
//         overflowY: 'auto',
//       }}
//       ref={ref}
//     >
//       <div style={{ height: treeHeight, display: 'flex' }}>
//         <SpeciesNames
//           colorScheme={colorScheme}
//           rowData={rowData}
//           rowHeights={rowHeights}
//           ancestorCollapsed={ancestorCollapsed}
//           nodes={nodes}
//         />
//         <MSARows
//           style={{
//             fontFamily: charFontName,
//             fontSize: `${genericRowHeight}px`,
//             overflow: 'auto',
//           }}
//           scrollTop={ref.current ? ref.current.scrollTop : 0}
//           colorScheme={colorScheme}
//           rowData={rowData}
//           rowHeights={rowHeights}
//           ancestorCollapsed={ancestorCollapsed}
//           nodes={nodes}
//         />
//       </div>
//     </div>
//   )

//   // return { element: container }
// }
//
//
//
const treeOfLife = `(((((((((((((((((((Escherichia_coli_EDL933:0.00000,Escherichia_coli_O157_H7:0.00000)Escherichia_subclade:0.00044[96],((Escherichia_coli_O6:0.00000,Escherichia_coli_K12:0.00022)Escherichia_subclade:0.00022[76],(Shigella_flexneri_2a_2457T:0.00000,Shigella_flexneri_2a_301:0.00000)Shigella:0.00266[100])Enterobacteriaceae_subclade:0.00000[75])Enterobacteriaceae_subclade:0.00813[100],((Salmonella_enterica:0.00000,Salmonella_typhi:0.00000)Salmonella_subclade:0.00146[100],Salmonella_typhimurium:0.00075)Salmonella:0.00702[100])Enterobacteriaceae_subclade:0.03131[100],((Yersinia_pestis_Medievalis:0.00000,(Yersinia_pestis_KIM:0.00000,Yersinia_pestis_CO92:0.00000)Yersinia_subclade:0.00000[31])Yersinia:0.03398[100],Photorhabdus_luminescens:0.05076)Enterobacteriaceae_subclade:0.01182[61])Enterobacteriaceae_subclade:0.02183[98],((Blochmannia_floridanus:0.32481,Wigglesworthia_brevipalpis:0.35452)Enterobacteriaceae_subclade:0.08332[100],(Buchnera_aphidicola_Bp:0.27492,(Buchnera_aphidicola_APS:0.09535,Buchnera_aphidicola_Sg:0.10235)Buchnera_subclade:0.10140[100])Buchnera:0.06497[100])Enterobacteriaceae_subclade:0.15030[100])Enterobacteriaceae:0.02808[100],((Pasteurella_multocida:0.03441,Haemophilus_influenzae:0.03754)Pasteurellaceae_subclade:0.01571[94],Haemophilus_ducreyi:0.05333)Pasteurellaceae:0.07365[100])Gammaproteobacteria_subclade:0.03759[100],((((Vibrio_vulnificus_YJ016:0.00021,Vibrio_vulnificus_CMCP6:0.00291)Vibrio_subclade:0.01212[100],Vibrio_parahaemolyticus:0.01985)Vibrio_subclade:0.01536[100],Vibrio_cholerae:0.02995)Vibrio:0.02661[100],Photobacterium_profundum:0.06131)Vibrionaceae:0.05597[100])Gammaproteobacteria_subclade:0.03492[81],Shewanella_oneidensis:0.10577)Gammaproteobacteria_subclade:0.12234[100],((Pseudomonas_putida:0.02741,Pseudomonas_syringae:0.03162)Pseudomonas_subclade:0.02904[100],Pseudomonas_aeruginosa:0.03202)Pseudomonas:0.14456[100])Gammaproteobacteria_subclade:0.04492[98],((Xylella_fastidiosa_700964:0.01324,Xylella_fastidiosa_9a5c:0.00802)Xylella:0.10192[100],(Xanthomonas_axonopodis:0.01069,Xanthomonas_campestris:0.00934)Xanthomonas:0.05037[100])Xanthomonadaceae:0.24151[100])Gammaproteobacteria_subclade:0.02475[49],Coxiella_burnetii:0.33185)Gammaproteobacteria:0.03328[54],((((Neisseria_meningitidis_A:0.00400,Neisseria_meningitidis_B:0.00134)Neisseria:0.12615[100],Chromobacterium_violaceum:0.09623)Neisseriaceae:0.07131[100],((Bordetella_pertussis:0.00127,(Bordetella_parapertussis:0.00199,Bordetella_bronchiseptica:0.00022)Bordetella_subclade:0.00006[67])Bordetella:0.14218[100],Ralstonia_solanacearum:0.11464)Burkholderiales:0.08478[100])Betaproteobacteria_subclade:0.03840[75],Nitrosomonas_europaea:0.22059)Betaproteobacteria:0.08761[100])Proteobacteria_subclade:0.16913[100],((((((Agrobacterium_tumefaciens_Cereon:0.00000,Agrobacterium_tumefaciens_WashU:0.00000):0.05735[100],Rhizobium_meliloti:0.05114)Sinorhizobium:0.05575[100],((Brucella_suis:0.00102,Brucella_melitensis:0.00184)Brucella:0.08660[100],Rhizobium_loti:0.09308)Rhizobiales_subclade:0.02384[51])Rhizobiales_subclade:0.08637[100],(Rhodopseudomonas_palustris:0.04182,Bradyrhizobium_japonicum:0.06346)Bradyrhizobiaceae:0.14122[100])Rhizobiales:0.05767[100],Caulobacter_crescentus:0.23943)Alphaproteobacteria_subclade:0.11257[100],(Wolbachia_sp._wMel:0.51596,(Rickettsia_prowazekii:0.04245,Rickettsia_conorii:0.02487)Rickettsia:0.38019[100])Rickettsiaceae:0.12058[100])Alphaproteobacteria:0.12365[100])Proteobacteria_subclade:0.06301[100],((((Helicobacter_pylori_J99:0.00897,Helicobacter_pylori_26695:0.00637)Helicobacter_subclade:0.19055[100],Helicobacter_hepaticus:0.12643)Helicobacter:0.05330[100],Wolinella_succinogenes:0.11644)Helicobacteraceae:0.09105[100],Campylobacter_jejuni:0.20399)Campylobacterales:0.41390[100])Proteobacteria_subclade:0.04428[82],((Desulfovibrio_vulgaris:0.38320,(Geobacter_sulfurreducens:0.22491,Bdellovibrio_bacteriovorus:0.45934)Deltaproteobacteria_subclade:0.04870[43])Deltaproteobacteria:0.04100[69],(Acidobacterium_capsulatum:0.24572,Solibacter_usitatus:0.29086)Acidobacteria:0.20514[100])Bacteria_subclade:0.04214[64])Bacteria_subclade:0.05551[98],((Fusobacterium_nucleatum:0.45615,(Aquifex_aeolicus:0.40986,Thermotoga_maritima:0.34182)Bacteria_subclade:0.07696[100])Bacteria_subclade:0.03606[35],(((Thermus_thermophilus:0.26583,Deinococcus_radiodurans:0.29763)Deinococci:0.24776[100],Dehalococcoides_ethenogenes:0.53988)Bacteria_subclade:0.04370[35],((((Nostoc_sp._PCC_7120:0.12014,Synechocystis_sp._PCC6803:0.15652)Cyanobacteria_subclade:0.04331[98],Synechococcus_elongatus:0.13147)Cyanobacteria_subclade:0.05040[100],(((Synechococcus_sp._WH8102:0.06780,Prochlorococcus_marinus_MIT9313:0.05434)Cyanobacteria_subclade:0.04879[100],Prochlorococcus_marinus_SS120:0.10211)Cyanobacteria_subclade:0.04238[74],Prochlorococcus_marinus_CCMP1378:0.16170)Cyanobacteria_subclade:0.20442[100])Cyanobacteria_subclade:0.07646[100],Gloeobacter_violaceus:0.23764)Cyanobacteria:0.24501[100])Bacteria_subclade:0.04332[39])Bacteria_subclade:0.02720[51])Bacteria_subclade:0.03471[74],((((Gemmata_obscuriglobus:0.36751,Rhodopirellula_baltica:0.38017)Planctomycetaceae:0.24062[100],((Leptospira_interrogans_L1-130:0.00000,Leptospira_interrogans_56601:0.00027)Leptospira:0.47573[100],((Treponema_pallidum:0.25544,Treponema_denticola:0.16072)Treponema:0.19057[100],Borrelia_burgdorferi:0.42323)Spirochaetaceae:0.20278[100])Spirochaetales:0.07248[95])Bacteria_subclade:0.04615[42],(((Tropheryma_whipplei_TW08/27:0.00009,Tropheryma_whipplei_Twist:0.00081)Tropheryma:0.44723[100],Bifidobacterium_longum:0.29283)Actinobacteridae_subclade:0.14429[100],(((((Corynebacterium_glutamicum_13032:0.00022,Corynebacterium_glutamicum:0.00000)Corynebacterium_subclade:0.03415[100],Corynebacterium_efficiens:0.02559)Corynebacterium_subclade:0.03682[100],Corynebacterium_diphtheriae:0.06479)Corynebacterium:0.13907[100],(((Mycobacterium_bovis:0.00067,(Mycobacterium_tuberculosis_CDC1551:0.00000,Mycobacterium_tuberculosis_H37Rv:0.00000)Mycobacterium_subclade:0.00022[98])Mycobacterium_subclade:0.03027[100],Mycobacterium_leprae:0.05135)Mycobacterium_subclade:0.01514[97],Mycobacterium_paratuberculosis:0.02091)Mycobacterium:0.11523[100])Corynebacterineae:0.09883[100],(Streptomyces_avermitilis:0.02680,Streptomyces_coelicolor:0.02678)Streptomyces:0.16707[100])Actinomycetales_subclade:0.06110[91])Actinobacteridae:0.26800[100])Bacteria_subclade:0.03480[23],((Fibrobacter_succinogenes:0.51984,(Chlorobium_tepidum:0.37204,(Porphyromonas_gingivalis:0.11304,Bacteroides_thetaiotaomicron:0.13145)Bacteroidales:0.34694[100])Bacteroidetes/Chlorobi_group:0.09237[100])Bacteria_subclade:0.04841[62],(((Chlamydophila_pneumoniae_TW183:0.00000,(Chlamydia_pneumoniae_J138:0.00000,(Chlamydia_pneumoniae_CWL029:0.00000,Chlamydia_pneumoniae_AR39:0.00000)Chlamydophila_subclade:0.00000[37])Chlamydophila_subclade:0.00000[44])Chlamydophila_subclade:0.10482[100],Chlamydophila_caviae:0.05903)Chlamydophila:0.04170[98],(Chlamydia_muridarum:0.01938,Chlamydia_trachomatis:0.02643)Chlamydia:0.06809[100])Chlamydiaceae:0.60169[100])Bacteria_subclade:0.04443[32])Bacteria_subclade:0.04284[67])Bacteria_subclade:0.02646[66],((Thermoanaerobacter_tengcongensis:0.17512,((Clostridium_tetani:0.10918,Clostridium_perfringens:0.11535)Clostridium_subclade:0.03238[78],Clostridium_acetobutylicum:0.11396)Clostridium:0.15056[100])Clostridia:0.11788[100],(((((Mycoplasma_mobile:0.27702,Mycoplasma_pulmonis:0.28761)Mycoplasma_subclade:0.28466[100],((((Mycoplasma_pneumoniae:0.10966,Mycoplasma_genitalium:0.11268)Mycoplasma_subclade:0.31768[100],Mycoplasma_gallisepticum:0.24373)Mycoplasma_subclade:0.14180[100],Mycoplasma_penetrans:0.34890)Mycoplasma_subclade:0.06674[94],Ureaplasma_parvum:0.33874)Mycoplasmataceae_subclade:0.19177[100])Mycoplasmataceae_subclade:0.07341[100],Mycoplasma_mycoides:0.37680)Mycoplasmataceae:0.12541[100],Phytoplasma_Onion_yellows:0.47843)Mollicutes:0.09099[100],(((((Listeria_monocytogenes_F2365:0.00063,Listeria_monocytogenes_EGD:0.00144)Listeria_subclade:0.00235[90],Listeria_innocua:0.00248)Listeria:0.13517[100],((Oceanobacillus_iheyensis:0.13838,Bacillus_halodurans:0.09280)Bacillaceae_subclade:0.02676[91],(((Bacillus_cereus_ATCC_14579:0.00342,Bacillus_cereus_ATCC_10987:0.00123)Bacillus_subclade:0.00573[100],Bacillus_anthracis:0.00331)Bacillus_subclade:0.08924[100],Bacillus_subtilis:0.07876)Bacillus:0.01984[96])Bacillaceae:0.03907[100])Bacillales_subclade:0.02816[69],((Staphylococcus_aureus_MW2:0.00000,(Staphylococcus_aureus_N315:0.00022,Staphylococcus_aureus_Mu50:0.00022)Staphylococcus_subclade:0.00022[61])Staphylococcus_subclade:0.02479[100],Staphylococcus_epidermidis:0.03246)Staphylococcus:0.17366[100])Bacillales:0.02828[64],(((((((Streptococcus_agalactiae_III:0.00110,Streptococcus_agalactiae_V:0.00155)Streptococcus_subclade:0.01637[100],(Streptococcus_pyogenes_M1:0.00134,(Streptococcus_pyogenes_MGAS8232:0.00045,(Streptococcus_pyogenes_MGAS315:0.00000,Streptococcus_pyogenes_SSI-1:0.00022)Streptococcus_subclade:0.00110[100])Streptococcus_subclade:0.00066[87])Streptococcus_subclade:0.02250[100])Streptococcus_subclade:0.01360[100],Streptococcus_mutans:0.04319)Streptococcus_subclade:0.01920[99],(Streptococcus_pneumoniae_R6:0.00119,Streptococcus_pneumoniae_TIGR4:0.00124)Streptococcus_subclade:0.03607[100])Streptococcus:0.04983[100],Lactococcus_lactis:0.11214)Streptococcaceae:0.08901[100],Enterococcus_faecalis:0.07946)Lactobacillales_subclade:0.03958[100],(Lactobacillus_johnsonii:0.20999,Lactobacillus_plantarum:0.14371)Lactobacillus:0.06763[100])Lactobacillales:0.08989[100])Bacilli:0.08905[100])Firmicutes_subclade:0.09540[92])Firmicutes:0.04315[54])Bacteria:1.34959,(((((Thalassiosira_pseudonana:0.33483,(Cryptosporidium_hominis:0.25048,Plasmodium_falciparum:0.28267)Apicomplexa:0.14359[100])Eukaryota_subclade:0.03495[42],(((Oryza_sativa:0.07623,Arabidopsis_thaliana:0.09366)Streptophyta:0.15770[100],Cyanidioschyzon_merolae:0.38319)Eukaryota_subclade:0.08133[96],(Dictyostelium_discoideum:0.34685,(((Eremothecium_gossypii:0.07298,Saccharomyces_cerevisiae:0.07619)Saccharomycetaceae:0.21170[100],Schizosaccharomyces_pombe:0.24665)Ascomycota:0.15370[100],(((Anopheles_gambiae:0.10724,Drosophila_melanogaster:0.10233)Diptera:0.09870[100],((Takifugu_rubripes:0.03142,Danio_rerio:0.05230)Actinopterygii:0.04335[100],(((Rattus_norvegicus:0.03107,Mus_musculus:0.01651)Murinae:0.00398[91],(Homo_sapiens:0.00957,Pan_troglodytes:0.03864)Hominidae:0.01549[100])Euarchontoglires:0.01629[99],Gallus_gallus:0.04596)Gnathostomata_subclade:0.01859[100])Gnathostomata:0.09688[100])Metazoa_subclade:0.03693[95],(Caenorhabditis_elegans:0.01843,Caenorhabditis_briggsae:0.01896)Caenorhabditis:0.24324[100])Metazoa:0.09911[100])Eukaryota_subclade:0.04004[85])Eukaryota_subclade:0.02708[41])Eukaryota_subclade:0.02636[44])Eukaryota_subclade:0.06455[87],Leishmania_major:0.45664)Eukaryota_subclade:0.10129[100],Giardia_lamblia:0.55482)Eukaryota:0.57543[100],((Nanoarchaeum_equitans:0.81078,(((Sulfolobus_tokodaii:0.17389,Sulfolobus_solfataricus:0.18962)Sulfolobus:0.33720[100],Aeropyrum_pernix:0.43380)Thermoprotei_subclade:0.09462[94],Pyrobaculum_aerophilum:0.55514)Thermoprotei:0.12018[100])Archaea_subclade:0.15444[100],((Thermoplasma_volcanium:0.10412,Thermoplasma_acidophilum:0.09785)Thermoplasma:0.66151[100],((((Methanobacterium_thermautotrophicum:0.36583,Methanopyrus_kandleri:0.35331)Euryarchaeota_subclade:0.07446[99],(Methanococcus_maripaludis:0.28592,Methanococcus_jannaschii:0.13226)Methanococcales:0.23828[100])Euryarchaeota_subclade:0.06284[100],((Pyrococcus_horikoshii:0.02786,Pyrococcus_abyssi:0.02179)Pyrococcus_subclade:0.02239[100],Pyrococcus_furiosus:0.02366)Pyrococcus:0.36220[100])Euryarchaeota_subclade:0.04469[51],(Archaeoglobus_fulgidus:0.34660,(Halobacterium_sp._NRC-1:0.61597,(Methanosarcina_acetivorans:0.02602,Methanosarcina_mazei:0.03087)Methanosarcina:0.30588[100])Euryarchaeota_subclade:0.12801[100])Euryarchaeota_subclade:0.10395[100])Euryarchaeota_subclade:0.06815[62])Euryarchaeota:0.11833[99])Archaea:0.43325[100]):0.88776);`

const data = treeOfLife
function initD3(
  ref: HTMLDivElement,
  outerWidth: number,
  outerHeight: number,
  processedData: any,
) {
  const dataExample = []

  for (let i = 0; i < 10000; i++) {
    const x = Math.floor(Math.random() * 999999) + 1
    const y = Math.floor(Math.random() * 999999) + 1
    dataExample.push([x, y])
  }

  const pointColor = '#3585ff'

  const margin = { top: 20, right: 15, bottom: 60, left: 20 }
  const width = outerWidth - margin.left - margin.right
  const height = outerHeight - margin.top - margin.bottom

  const container = d3.select(ref)

  console.log({ root })
  // setBrLength(root, (root.data.length = 0), innerRadius / maxLength(root))
  // ref.current.innerHTML = ''
  // const svg = d3
  //   .select(ref.current)
  //   .attr('font-family', 'sans-serif')
  //   .attr('font-size', 10)

  // Init SVG
  // const svgChart = container
  //   .append('svg:svg')
  //   .attr('width', outerWidth)
  //   .attr('height', outerHeight)
  //   .attr('class', 'svg-plot')
  //   .style('position', `absolute`)
  //   .append('g')
  //   .attr('transform', `translate(${margin.left}, ${margin.top})`)

  // const gridSize = 20
  // const sampleLabels = svgChart
  //   .selectAll('.sampleLabel')
  //   .data(processedData.alns)
  //   .enter()
  //   .append('text')
  //   .text(function (d, i) {
  //     return d.id
  //   })
  //   .attr('x', 0)
  //   .attr('y', function (d, i) {
  //     return i * gridSize
  //   })

  // svgChart
  //   .selectAll('point')
  //   .data(processedData.alns)
  //   .enter()
  //   .append('g')

  //   .selectAll('text') // these
  //   .data((d, i, j) => {
  //     return d.seq.split('')
  //   })
  //   .enter()
  //   .append('rect')
  //   .attr('x', function (d, i, j) {
  //     return i * gridSize
  //   })
  //   .attr('y', function (d, i, j) {
  //     return 0 * gridSize
  //   })
  //   .attr('width', gridSize)
  //   .attr('height', gridSize)
  //   .style('fill', function (d) {
  //     return 'red'
  //     // colors[d.base]
  //   })

  // // Init Canvas
  // const canvasChart = container
  //   .append('canvas')
  //   .attr('width', width)
  //   .attr('height', height)
  //   .style('position', `absolute`)
  //   .style('margin-left', `${margin.left}px`)
  //   .style('margin-top', `${margin.top}px`)
  //   .attr('class', 'canvas-plot')

  // const context = canvasChart.node().getContext('2d')

  // // Init Scales
  // const x = d3
  //   .scaleLinear()
  //   .domain([0, d3.max(dataExample, d => d[0])])
  //   .range([0, width])
  //   .nice()
  // const y = d3
  //   .scaleLinear()
  //   .domain([0, d3.max(dataExample, d => d[1])])
  //   .range([height, 0])
  //   .nice()

  // // Init Axis
  // const xAxis = d3.axisBottom(x)
  // const yAxis = d3.axisLeft(y)

  // Add Axis
  // const gxAxis = svgChart
  //   .append('g')
  //   .attr('transform', `translate(0, ${height})`)
  //   .call(xAxis)

  // const gyAxis = svgChart.append('g').call(yAxis)

  // Add labels
  // svgChart
  //   .append('text')
  //   .attr('x', `-${height / 2}`)
  //   .attr('dy', '-3.5em')
  //   .attr('transform', 'rotate(-90)')
  //   .text('Axis Y')
  // svgChart
  //   .append('text')
  //   .attr('x', `${width / 2}`)
  //   .attr('y', `${height + 40}`)
  //   .text('Axis X')

  // Draw plot on canvas
  // function draw(transform) {
  //   const scaleX = transform.rescaleX(x)
  //   const scaleY = transform.rescaleY(y)

  //   // gxAxis.call(xAxis.scale(scaleX))
  //   // gyAxis.call(yAxis.scale(scaleY))

  //   context.clearRect(0, 0, width, height)

  //   dataExample.forEach(point => {
  //     drawPoint(scaleX, scaleY, point, transform.k)
  //   })
  // }

  // // Initial draw made with no zoom
  // draw(d3.zoomIdentity)

  // function drawPoint(scaleX, scaleY, point, k) {
  //   context.beginPath()
  //   context.fillStyle = pointColor
  //   const px = scaleX(point[0])
  //   const py = scaleY(point[1])
  //   // context.fillRect(point[0], point[1], 10, 10)

  //   context.arc(px, py, 1.2 * k, 0, 2 * Math.PI, true)
  //   context.fill()
  // }

  // Zoom/Drag handler
  // const zoom_function = d3
  //   .zoom()
  //   .scaleExtent([1, 1000])
  //   .on('zoom', event => {
  //     const { transform } = event
  //     context.save()
  //     draw(transform)
  //     context.restore()
  //   })

  // canvasChart.call(zoom_function)
}

export default (pluginManager: PluginManager) => {
  const { jbrequire } = pluginManager

  return observer(({ model }: { model: MsaViewModel }) => {
    const { width, height, processedData, initialized } = model
    const ref = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
      if (initialized && ref.current && !model.drawn) {
        initD3(ref.current, 800, 600, processedData)
        model.setDrawn(true)
      }
      // const ctx = ref.current.getContext('2d')
      // if (!ctx) return
      // ctx.fillStyle = 'red'
      // ctx.fillRect(0, 0, 100, 100)
      // console.log({ processedData })
    }, [processedData, initialized, width, height, model])

    if (!initialized) {
      return <ImportForm model={model} />
    }

    // console.log(
    //   'test',
    //   alns.map(f => f.id),
    // )

    return <div style={{ height, width, position: 'relative' }} ref={ref} />
  })
}
