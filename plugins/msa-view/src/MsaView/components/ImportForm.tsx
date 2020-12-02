import React, { useState } from 'react'
import { observer } from 'mobx-react'
import { openLocation } from '@jbrowse/core/util/io'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import FileSelector from '@jbrowse/core/ui/FileSelector'

const useStyles = makeStyles(theme => ({
  importFormContainer: {
    padding: theme.spacing(2),
  },
  importFormEntry: {
    minWidth: 180,
  },
}))

const ImportForm = observer(({ model }: { model: any }) => {
  const classes = useStyles()
  const [file, setFile] = useState()

  return (
    <Container className={classes.importFormContainer}>
      <Grid container spacing={1} justify="center" alignItems="center">
        <Grid item>
          <Typography>Open a MSA file</Typography>
          <FileSelector
            location={file}
            setLocation={setFile}
            localFileAllowed
          />
        </Grid>

        <Grid item>
          <Button
            onClick={async () => {
              try {
                if (file) {
                  const data = await openLocation(file).readFile('utf8')
                  model.setData(data)
                }
              } catch (e) {
                model.setError(e)
              }
            }}
            variant="contained"
            color="primary"
          >
            Open
          </Button>
        </Grid>
      </Grid>
    </Container>
  )
})

export default ImportForm
