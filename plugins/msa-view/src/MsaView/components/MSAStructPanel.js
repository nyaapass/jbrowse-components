/* eslint-disable react/prop-types */
import React, { Component } from 'react'
import pv from 'bio-pv'

import { Select, MenuItem, FormControlLabel, Checkbox } from '@material-ui/core'

import MSAStruct from './MSAStruct'

class MSAStructPanel extends Component {
  constructor(props) {
    super(props)

    this.state = {
      config: this.props.initConfig,
      viewMode: 'cartoon',
      colorScheme: 'ssSuccession',
    }
  }

  render() {
    return this.props.structures.length ? (
      <div className="MSA-structure-panel">
        <div className="MSA-structure-controls">
          <Select
            value={this.state.viewMode}
            onChange={this.handleSelectViewType.bind(this)}
          >
            <MenuItem value="cartoon">Cartoons</MenuItem>
            <MenuItem value="tube">Tube</MenuItem>
            <MenuItem value="spheres">Spheres</MenuItem>
            <MenuItem value="ballsAndSticks">Balls and sticks</MenuItem>
          </Select>

          <Select
            value={this.state.colorScheme}
            onChange={this.handleSelectColorScheme.bind(this)}
          >
            <MenuItem value="uniform">Uniform</MenuItem>
            <MenuItem value="byChain">Chain</MenuItem>
            <MenuItem value="bySS">Secondary structure</MenuItem>
            <MenuItem value="ssSuccession">
              Secondary structure gradient
            </MenuItem>
            <MenuItem value="rainbow">Rainbow</MenuItem>
          </Select>

          <FormControlLabel
            control={
              <Checkbox
                checked={this.state.config.showMouseoverLabel}
                onChange={this.handleMouseoverLabelConfig.bind(this)}
              />
            }
            label="Show label on hover"
          />
        </div>

        <div className="MSA-structures">
          {this.props.structures.map(structure => {
            return (
              <MSAStruct
                key={structure.key}
                structure={structure}
                config={this.state.config}
                setViewType={() => this.setViewType(structure)}
                updateStructure={info =>
                  this.props.updateStructure(structure, info)
                }
                handleCloseStructure={this.props.handleCloseStructure}
                handleMouseoverResidue={(chain, pdbSeqPos) =>
                  this.props.handleMouseoverResidue(structure, chain, pdbSeqPos)
                }
              />
            )
          })}
        </div>
      </div>
    ) : (
      ''
    )
  }

  handleMouseoverLabelConfig(event) {
    const { config } = this.state
    config.showMouseoverLabel = event.target.checked
    this.setState({ config })
  }

  redrawStructureDelay() {
    return 500
  }

  setViewType(structure, viewMode, colorScheme) {
    viewMode = viewMode || this.state.viewMode
    colorScheme = colorScheme || this.state.colorScheme
    const { pdb, viewer } = structure
    if (viewer) {
      viewer.clear()
      const geometry = viewer.renderAs('protein', pdb, viewMode, {
        color: pv.color[colorScheme](),
      })
      this.props.updateStructure(structure, { geometry })
    }
    this.props.structures.forEach(s => {
      this.props.updateStructure(s, { trueAtomColor: {} })
    })
    this.requestRedrawStructures()
  }

  handleSelectViewType(evt) {
    const viewMode = evt.target.value
    this.setState({ viewMode })
    this.props.structures.forEach(s => this.setViewType(s, viewMode))
  }

  handleSelectColorScheme(evt) {
    const colorScheme = evt.target.value
    this.setState({ colorScheme })
    this.props.structures.forEach(s =>
      this.setViewType(s, undefined, colorScheme),
    )
  }

  addLabelToStructuresOnMouseover(column) {
    const labelConfig = this.state.config.label || {
      font: 'sans-serif',
      fontSize: 12,
      fontColor: '#f62',
      fillStyle: 'white',
      backgroundAlpha: 0.4,
    }
    const atomHighlightColor = this.state.config.atomHighlightColor || 'red'
    this.props.structures.forEach(s => {
      const colToSeqPos = this.props.alignIndex.alignColToSeqPos[s.node]
      const seqCoords = this.props.seqCoords[s.node] || { startPos: 1 }
      if (colToSeqPos) {
        const seqPos = colToSeqPos[column]
        this.removeMouseoverLabels(s)
        if (!Array.isArray(s.structureInfo)) {
          s.structureInfo.chains.forEach(chainInfo => {
            const pdbSeqPos = seqPos + seqCoords.startPos
            if (
              (!chainInfo.startPos || pdbSeqPos >= chainInfo.startPos) &&
              (!chainInfo.endPos || pdbSeqPos <= chainInfo.endPos)
            ) {
              const pdbChain = chainInfo.chain
              const residues = s.pdb.residueSelect(res => {
                return (
                  res.num() === pdbSeqPos &&
                  (typeof pdbChain === 'undefined' ||
                    res.chain().name() === pdbChain)
                )
              })
              if (residues) {
                residues.eachResidue(res => {
                  const label = `mouseover${s.mouseoverLabel.length + 1}`
                  if (this.state.config.showMouseoverLabel) {
                    s.viewer.label(
                      label,
                      res.qualifiedName(),
                      res.centralAtom().pos(),
                      labelConfig,
                    )
                  }
                  res.atoms().forEach(atom => {
                    if (!s.trueAtomColor[atom.index()]) {
                      const atomColor = [0, 0, 0, 0]
                      s.geometry.getColorForAtom(atom, atomColor)
                      s.trueAtomColor[atom.index()] = atomColor
                    }
                  })
                  this.setColorForAtoms(
                    s.geometry,
                    res.atoms(),
                    atomHighlightColor,
                  )
                  s.mouseoverLabel.push({ label, res })
                })
              }
            }
          })
        }
      }
    })
    this.requestRedrawStructures()
  }

  removeLabelFromStructuresOnMouseout() {
    this.props.structures.forEach(s => {
      this.removeMouseoverLabels(s)
    })
    this.requestRedrawStructures()
  }

  removeMouseoverLabels(structure) {
    structure.mouseoverLabel.forEach(labelInfo => {
      if (this.state.config.showMouseoverLabel) {
        structure.viewer.rm(labelInfo.label)
      }
      const byColor = {}
      labelInfo.res.atoms().forEach(atom => {
        const trueColor = structure.trueAtomColor[atom.index()]
        const colorString = trueColor.toString()
        byColor[colorString] = byColor[colorString] || { trueColor, atoms: [] }
        byColor[colorString].atoms.push(atom)
      })
      Object.keys(byColor).forEach(col =>
        this.setColorForAtoms(
          structure.geometry,
          byColor[col].atoms,
          byColor[col].trueColor,
        ),
      )
    })
    structure.mouseoverLabel = []
  }

  setColorForAtoms(go, atoms, color) {
    const view = go.structure().createEmptyView()
    atoms.forEach(atom => view.addAtom(atom))
    go.colorBy(pv.color.uniform(color), view)
  }

  // delayed request to redraw structure
  requestRedrawStructures() {
    this.props.setTimer('redraw', this.redrawStructureDelay(), () => {
      this.props.structures
        .filter(s => s.viewer)
        .forEach(s => s.viewer.requestRedraw())
    })
  }
}

export default MSAStructPanel
