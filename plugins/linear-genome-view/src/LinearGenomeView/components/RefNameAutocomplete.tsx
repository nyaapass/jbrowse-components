/**
 * Based on https://material-ui.com/components/autocomplete/#Virtualize.tsx
 */
import { Region } from '@jbrowse/core/util/types'
import { getSession } from '@jbrowse/core/util'
import CircularProgress from '@material-ui/core/CircularProgress'
import ListSubheader from '@material-ui/core/ListSubheader'
import TextField, { TextFieldProps as TFP } from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import Autocomplete from '@material-ui/lab/Autocomplete'
import { observer } from 'mobx-react'
import { getSnapshot } from 'mobx-state-tree'
import React, { useEffect } from 'react'
import { ListChildComponentProps, VariableSizeList } from 'react-window'
import { LinearGenomeViewModel } from '..'

function renderRow(props: ListChildComponentProps) {
  const { data, index, style } = props
  // console.log('renderRow', props)
  return React.cloneElement(data[index], {
    style: {
      ...style,
    },
  })
}

const OuterElementContext = React.createContext({})

const OuterElementType = React.forwardRef<HTMLDivElement>((props, ref) => {
  const outerProps = React.useContext(OuterElementContext)
  // console.log('outerElementType props: ', props)
  // console.log('outerElementType ref: ', ref)
  return <div ref={ref} {...props} {...outerProps} />
})

// Adapter for react-window
const ListboxComponent = React.forwardRef<HTMLDivElement>(
  function ListboxComponent(props, ref) {
    // eslint-disable-next-line react/prop-types
    const { children, ...other } = props
    const itemData = React.Children.toArray(children)
    const itemCount = itemData.length
    const itemSize = 36

    // console.log('listboxcomponent props: ', props)
    // console.log('listboxcomponent ref: ', ref)
    const getChildSize = (child: React.ReactNode) => {
      if (React.isValidElement(child) && child.type === ListSubheader) {
        return 48
      }

      return itemSize
    }

    const getHeight = () => {
      if (itemCount > 8) {
        return 8 * itemSize
      }
      return itemData.map(getChildSize).reduce((a, b) => a + b, 0)
    }

    return (
      <div ref={ref}>
        <OuterElementContext.Provider value={other}>
          <VariableSizeList
            itemData={itemData}
            height={getHeight()}
            width="100%"
            key={itemCount}
            outerElementType={OuterElementType}
            innerElementType="ul"
            itemSize={(index: number) => getChildSize(itemData[index])}
            overscanCount={5}
            itemCount={itemCount}
          >
            {renderRow}
          </VariableSizeList>
        </OuterElementContext.Provider>
      </div>
    )
  },
)

function RefNameAutocomplete({
  model,
  onSelect,
  assemblyName,
  value,
  style,
  TextFieldProps = {},
}: {
  model: LinearGenomeViewModel
  onSelect: (region: Region | undefined) => void
  assemblyName?: string
  value?: string
  style?: React.CSSProperties
  TextFieldProps?: TFP
}) {
  const [searchValue, setSearchValue] = React.useState<string | undefined>()
  const session = getSession(model)
  const { assemblyManager } = getSession(model)
  const assembly = assemblyName && assemblyManager.get(assemblyName)
  const regions: Region[] = (assembly && assembly.regions) || []
  const {
    coarseVisibleLocStrings,
    visibleLocStrings: nonCoarseVisibleLocStrings,
  } = model
  const visibleLocStrings =
    coarseVisibleLocStrings || nonCoarseVisibleLocStrings
  // state of the component
  const loading = !regions.length
  const current =
    visibleLocStrings || (regions.length ? regions[0].refName : undefined)
  const refNames = regions.map(option => option.refName)

  useEffect(() => {
    console.log('just mounted')
    // would want to fetch information regarding identifiers here
    // name indexing
  })

  function navTo(locString: string) {
    try {
      model.navToLocString(locString)
    } catch (e) {
      console.warn(e)
      session.notify(`${e}`, 'warning')
    }
  }

  function onChange(_: unknown, newRegionName: string | null) {
    if (newRegionName) {
      const newRegion = regions.find(region => region.refName === newRegionName)
      if (newRegion) {
        // @ts-ignore
        onSelect(getSnapshot(newRegion))
      }
    }
  }

  return (
    <Autocomplete
      id={`refNameAutocomplete-${model.id}`}
      // freeSolo
      disableListWrap
      disableClearable
      ListboxComponent={
        ListboxComponent as React.ComponentType<
          React.HTMLAttributes<HTMLElement>
        >
      }
      options={refNames} // for now only refNames but will need identifiers
      // groupBy={option => option.group}
      loading={loading}
      value={current || ''}
      disabled={!assemblyName || loading}
      noOptionsText={`Navigating to... ${searchValue}`}
      style={style}
      onChange={onChange}
      renderInput={params => {
        const { helperText, InputProps = {} } = TextFieldProps
        const TextFieldInputProps = {
          ...params.InputProps,
          ...InputProps,
          endAdornment: (
            <>
              {loading ? <CircularProgress color="inherit" size={20} /> : null}
              {params.InputProps.endAdornment}
            </>
          ),
        }
        return (
          <TextField
            {...params}
            {...TextFieldProps}
            helperText={helperText}
            InputProps={TextFieldInputProps}
            onChange={event => {
              setSearchValue(event.target.value)
            }}
            onKeyPress={event => {
              if (event.key === 'Enter') {
                navTo(searchValue || '')
              }
            }}
          />
        )
      }}
      renderOption={regionName => <Typography noWrap>{regionName}</Typography>} // will need to change regionName -> refName || identifier
    />
  )
}

export default observer(RefNameAutocomplete)
