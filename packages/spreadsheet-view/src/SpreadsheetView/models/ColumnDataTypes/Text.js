export default pluginManager => {
  const { jbrequire } = pluginManager
  const { types, getParent, getType } = jbrequire('mobx-state-tree')
  const { observer } = jbrequire('mobx-react')
  const React = jbrequire('react')

  const { getPropertyType, getEnumerationValues, getSubType } = jbrequire(
    '@gmod/jbrowse-core/util/mst-reflection',
  )

  const MakeSpreadsheetColumnType = jbrequire(
    require('./MakeSpreadsheetColumnType'),
  )

  const { makeStyles } = jbrequire('@material-ui/core/styles')
  const Container = jbrequire('@material-ui/core/Container')
  const Grid = jbrequire('@material-ui/core/Grid')
  const IconButton = jbrequire('@material-ui/core/IconButton')
  const Icon = jbrequire('@material-ui/core/Icon')
  const TextField = jbrequire('@material-ui/core/TextField')
  const MenuItem = jbrequire('@material-ui/core/MenuItem')
  const InputAdornment = jbrequire('@material-ui/core/InputAdornment')
  const Select = jbrequire('@material-ui/core/Select')

  const useStyles = makeStyles((/* theme */) => {
    return {
      textFilterControlAdornment: { marginRight: '-18px' },
      textFilterControl: {
        margin: 0,
        '& .MuiInput-formControl': {
          marginTop: 8,
        },
        '& .MuiInputLabel-formControl': {
          top: '-7px',
          '&.MuiInputLabel-shrink': {
            top: '-3px',
          },
        },
      },
    }
  })

  // React component for the column filter control
  const FilterReactComponent = observer(({ filterModel }) => {
    const classes = useStyles()
    const operationChoices = getEnumerationValues(
      getSubType(getPropertyType(getType(filterModel), 'operation')),
    )
    return (
      <>
        <Select
          value={filterModel.operation}
          onChange={event => {
            filterModel.setOperation(String(event.target.value))
          }}
        >
          {operationChoices.map(name => (
            <MenuItem key={name} value={name}>
              {name}
            </MenuItem>
          ))}
        </Select>{' '}
        <TextField
          label="text"
          value={filterModel.stringToFind}
          onChange={evt => filterModel.setString(evt.target.value)}
          className={classes.textFilterControl}
          margin="dense"
          InputProps={{
            endAdornment: (
              <InputAdornment
                className={classes.textFilterControlAdornment}
                position="end"
              >
                <IconButton
                  aria-label="clear filter"
                  onClick={() => filterModel.setString('')}
                  color="secondary"
                >
                  <Icon>clear</Icon>
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </>
    )
  })

  // MST model for the column filter control
  const ColumnTextFilter = types
    .model('ColumnTextFilter', {
      type: types.literal('Text'),
      columnNumber: types.integer,
      stringToFind: '',
      operation: types.optional(
        types.enumeration([
          'contains',
          'does not contain',
          'starts with',
          'ends with',
        ]),
        'contains',
      ),
    })
    .views(self => ({
      // returns a function that tests the given row
      get predicate() {
        let s = self.stringToFind // avoid closing over self
        if (!s)
          return function alwaysTrue() {
            return true
          }
        s = s.toLowerCase()
        return function stringPredicate(sheet, row) {
          const { cells } = row
          const { columnNumber } = self
          const cell = cells[columnNumber]
          // TODO: add support for derived cells
          // note: case insensitive
          if (cell && cell.text && cell.text.toLowerCase().indexOf(s) !== -1)
            return true
          return false
        }
      },
    }))
    .actions(self => ({
      setString(s) {
        self.stringToFind = s
      },
      setOperation(op) {
        self.operation = op
      },
    }))
    .volatile(() => ({ ReactComponent: FilterReactComponent }))

  const TextColumnType = MakeSpreadsheetColumnType('Text', {
    compare(cellA, cellB) {
      return cellA.text.localeCompare(cellB.text)
    },
    FilterModelType: ColumnTextFilter,
  })

  return TextColumnType
}
