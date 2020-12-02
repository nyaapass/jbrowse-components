import React, { useEffect, useRef } from 'react'
import { observer } from 'mobx-react'
import PluginManager from '@jbrowse/core/PluginManager'

import * as d3 from 'd3'
import ImportForm from './ImportForm'
import { MsaViewModel } from '../model'

// import colorSchemes from './colorSchemes'

// const defaultColorScheme = 'maeditor'

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

function initD3(
  ref: HTMLDivElement,
  outerWidth: number,
  outerHeight: number,
  model: any,
) {
  const { processedData, nodePositions } = model
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

  console.log({ root, processedData, nodePositions })
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

const TreeCanvas = observer(({ model }: { model: MsaViewModel }) => {
  const { treeWidth: width, height, tree } = model
  return (
    <>
      <g fill="none" stroke="#000">
        {tree.links().map(({ source, target }) => {
          const { x: sx, y: sy } = source
          const { x: tx, y: ty } = target
          const path = `M${sy} ${sx}V${tx}H${ty}`
          return <path key={path} d={path} />
        })}
      </g>

      {tree.leaves().map(node => {
        const {
          x,
          y,
          data: { name },
        } = node
        return (
          <text key={`${name}-${x}-${y}`} x={y} y={x}>
            {name}
          </text>
        )
      })}
    </>
  )
})

const MSA = observer(({ model }: { model: MsaViewModel }) => {
  return <div />
})
export default (pluginManager: PluginManager) => {
  const { jbrequire } = pluginManager

  return observer(({ model }: { model: MsaViewModel }) => {
    const { width, height, processedData, initialized, margin } = model
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (initialized && ref.current && !model.drawn) {
        initD3(ref.current, 800, 600, model)
        model.setDrawn(true)
      }
    }, [processedData, initialized, width, height, model])

    if (!initialized) {
      return <ImportForm model={model} />
    }

    return (
      <svg style={{ height, width }}>
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          <TreeCanvas model={model} />
          <MSA model={model} />
        </g>
      </svg>
    )
  })
}
