/* eslint-disable react/prop-types */
/* eslint curly:error */
import React, { Component } from 'react'
import { Select, MenuItem } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import pv from 'bio-pv'

class MSAStruct extends Component {
  constructor(props) {
    super(props)
    this.pvDivRef = React.createRef()
  }

  render() {
    const {
      structure,
      config: { width, height },
    } = this.props
    const wantStructure = Array.isArray(structure.structureInfo)
    const structureID = !wantStructure && structure.structureInfo.pdb
    return (
      <div
        className="MSA-structure"
        style={{
          width,
          height,
        }}
      >
        <div className="MSA-structure-name">{structure.node}</div>

        {structureID && (
          <div className="MSA-structure-label">{structureID}</div>
        )}

        <div className="MSA-structure-top">
          {wantStructure && (
            <Select
              value=""
              displayEmpty
              onChange={this.handleSelectStructure.bind(this)}
            >
              <MenuItem value="" disabled>
                Select a structure
              </MenuItem>
              {structure.structureInfo.map((info, n) => (
                <MenuItem key={n} value={info}>
                  {info.pdb}
                </MenuItem>
              ))}
            </Select>
          )}
          <div className="MSA-structure-close-button">
            <CloseIcon onClick={this.handleClose.bind(this)} />
          </div>
        </div>

        <div className="MSA-structure-pv" ref={this.pvDivRef} />
      </div>
    )
  }

  getPvConfig(structureConfig) {
    const { width, height } = structureConfig
    return (
      structureConfig.pvConfig || {
        width,
        height,
        antialias: true,
        quality: 'medium',
      }
    )
  }

  pdbUrlPrefix() {
    return 'https://files.rcsb.org/download/'
  }

  pdbUrlSuffix() {
    return '.pdb'
  }

  componentDidMount() {
    this.updatePv()
  }

  componentDidUpdate() {
    this.updatePv()
  }

  updatePv() {
    if (!Array.isArray(this.props.structure.structureInfo)) {
      this.loadStructure()
    }
  }

  handleSelectStructure(evt) {
    this.props.updateStructure({ structureInfo: evt.target.value })
  }

  loadStructure() {
    if (!this.props.structure.pdbFetchInitiated) {
      this.props.updateStructure({ pdbFetchInitiated: true })
      const structureConfig = this.props.config
      const pvConfig = this.getPvConfig(structureConfig)
      const viewer = pv.Viewer(this.pvDivRef.current, pvConfig)
      const loadFromPDB = !structureConfig.noRemoteStructures
      const pdbFilePath =
        (loadFromPDB ? this.pdbUrlPrefix() : structureConfig.pdbPrefix || '') +
        this.props.structure.structureInfo.pdb +
        (loadFromPDB ? this.pdbUrlSuffix() : structureConfig.pdbSuffix || '')
      pv.io.fetchPdb(pdbFilePath, pdb => {
        // display the protein as cartoon, coloring the secondary structure
        // elements in a rainbow gradient.
        this.props.updateStructure({ pdb, viewer })
        this.props.setViewType()
        viewer.centerOn(pdb)
        viewer.autoZoom()

        this.pvDivRef.current.addEventListener('mousemove', evt => {
          const rect = viewer.boundingClientRect()
          const picked = viewer.pick({
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top,
          })
          if (picked) {
            const target = picked.target()
            const residue = target.residue()
            const seqPos = residue.num()
            const chain = residue.chain().name()
            this.props.handleMouseoverResidue(chain, seqPos)
          } else {
            this.props.handleMouseoverResidue(null, null)
          }
        })

        this.pvDivRef.current.addEventListener('mouseleave', evt => {
          this.props.handleMouseoverResidue(null, null)
        })
      })
    }
  }

  handleClose(evt) {
    evt.preventDefault()
    this.props.handleCloseStructure(this.props.structure)
  }
}

export default MSAStruct
