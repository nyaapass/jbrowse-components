import React, { useEffect, useRef, useState } from 'react'
import { observer } from 'mobx-react'
import PluginManager from '@jbrowse/core/PluginManager'

import ImportForm from './ImportForm'
import { MsaViewModel } from '../model'

import colorSchemes from './colorSchemes'

const defaultColorScheme = 'maeditor'

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

export default (pluginManager: PluginManager) => {
  const { jbrequire } = pluginManager

  return observer(({ model }: { model: MsaViewModel }) => {
    const { width, height, processedData, initialized } = model
    const ref = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
      if (!ref.current) return
      const ctx = ref.current.getContext('2d')
      if (!ctx) return
      ctx.fillStyle = 'red'
      ctx.fillRect(0, 0, 100, 100)
      console.log({ processedData })
    }, [processedData, initialized, width, height])

    if (!initialized) {
      return <ImportForm model={model} />
    }

    const { alns } = processedData

    console.log(
      'test',
      alns.map(f => f.id),
    )

    return (
      <div style={{ display: 'flex' }}>
        <div>
          {alns.map(aln => (
            <div key={aln.id}>{aln.id}</div>
          ))}
        </div>
        <div>
          {alns.map(aln => (
            <div key={aln.id}>{aln.seq}</div>
          ))}
        </div>
        <canvas ref={ref} width={width} height={height} />
      </div>
    )
  })
}
