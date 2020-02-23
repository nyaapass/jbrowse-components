import { getConf } from '@gmod/jbrowse-core/configuration'
import BlockBasedTrack from '@gmod/jbrowse-plugin-linear-genome-view/src/BasicTrack/components/BlockBasedTrack'
import { observer, PropTypes as MobxPropTypes } from 'mobx-react'
import { Instance } from 'mobx-state-tree'
import React from 'react'
import { Axis, axisPropsFromTickScale, RIGHT } from 'react-d3-axis'
import { getScale } from '../../util'
// eslint-disable-next-line import/no-cycle
import { WiggleTrackModel } from '../model'

const powersOfTen: number[] = []
for (let i = -20; i < 20; i += 1) {
  powersOfTen.push(10 ** i)
}
const YScaleBar = observer(
  ({ model }: { model: Instance<WiggleTrackModel> }) => {
    const { domain, height } = model
    const scaleType = getConf(model, 'scaleType')
    const scale = getScale({
      scaleType,
      domain,
      range: [height, 0],
      inverted: getConf(model, 'inverted'),
    })
    const axisProps = axisPropsFromTickScale(scale, 4)
    const values =
      scaleType === 'log'
        ? axisProps.values.filter((s: number) => powersOfTen.includes(s))
        : axisProps.values
    return (
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 300,
          pointerEvents: 'none',
          height: '100%',
        }}
      >
        <Axis
          {...axisProps}
          values={values}
          format={(n: number) => n}
          style={{ orient: RIGHT }}
        />
      </svg>
    )
  },
)
function WiggleTrackComponent(props: { model: Instance<WiggleTrackModel> }) {
  const { model } = props
  const { ready, stats } = model
  return (
    <BlockBasedTrack {...props}>
      {ready && stats && model.needsScalebar ? (
        <YScaleBar model={model} />
      ) : null}
    </BlockBasedTrack>
  )
}

WiggleTrackComponent.propTypes = {
  model: MobxPropTypes.observableObject.isRequired,
}

export default observer(WiggleTrackComponent)
