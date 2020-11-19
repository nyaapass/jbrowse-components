import React, { useState } from 'react'
import { observer } from 'mobx-react'
import Dialog from '@material-ui/core/Dialog'
import { makeStyles } from '@material-ui/core/styles'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import ListSubheader from '@material-ui/core/ListSubheader'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Checkbox from '@material-ui/core/Checkbox'
import pluralize from 'pluralize'

const useStyles = makeStyles(theme => ({
  root: {
    margin: theme.spacing(1),
  },
  message: {
    padding: theme.spacing(3),
  },
  titleBox: {
    color: '#fff',
    backgroundColor: theme.palette.primary.main,
    textAlign: 'center',
  },
  dialogContent: {
    width: 600,
  },
  backButton: {
    color: '#fff',
    position: 'absolute',
    left: theme.spacing(4),
    top: theme.spacing(4),
  },
}))

const CurrentSession = observer(
  ({
    session,
    selectedDefault,
    handleCheckbox,
  }: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    session: any
    selectedDefault: string
    handleCheckbox: Function
  }) => {
    const classes = useStyles()

    return (
      <Paper className={classes.root}>
        <List subheader={<ListSubheader>Currently open session</ListSubheader>}>
          <ListItem>
            <ListItemIcon>
              <Checkbox
                checked={session.name === selectedDefault}
                onChange={() => handleCheckbox(session)}
              />
            </ListItemIcon>
            <ListItemText primary={session.name} />
          </ListItem>
        </List>
      </Paper>
    )
  },
)

const SetDefaultSession = observer(
  ({
    rootModel,
    open,
    onClose,
    currentDefault,
  }: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rootModel: any
    open: boolean
    onClose: Function
    currentDefault: string
  }) => {
    const classes = useStyles()
    const { session } = rootModel
    const [selectedDefault, setSelectedDefault] = useState(currentDefault)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function handleCheckbox(sessionSnapshot: any) {
      if (selectedDefault === sessionSnapshot.name) {
        setSelectedDefault('New session')
        rootModel.jbrowse.setDefaultSessionConf({
          name: `New session`,
        })
      } else {
        setSelectedDefault(sessionSnapshot.name)
        rootModel.jbrowse.setDefaultSessionConf(sessionSnapshot)
      }
    }

    return (
      <Dialog open={open}>
        <DialogTitle className={classes.titleBox}>
          Set Default Session
        </DialogTitle>
        <DialogContent>
          <CurrentSession
            session={session}
            selectedDefault={selectedDefault}
            handleCheckbox={handleCheckbox}
          />

          <Paper className={classes.root}>
            <List subheader={<ListSubheader>Saved sessions</ListSubheader>}>
              {session.savedSessions.length ? (
                session.savedSessions.map(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (sessionSnapshot: any) => {
                    const { views = [] } = sessionSnapshot
                    const totalTracks = views
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      .map((view: any) => view.tracks.length)
                      .reduce((a: number, b: number) => a + b, 0)
                    if (sessionSnapshot.name !== session.name) {
                      return (
                        <ListItem key={sessionSnapshot.name}>
                          <ListItemIcon>
                            <Checkbox
                              checked={sessionSnapshot.name === selectedDefault}
                              onChange={() => handleCheckbox(sessionSnapshot)}
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={sessionSnapshot.name}
                            secondary={`${views.length} ${pluralize(
                              'view',
                              views.length,
                            )}; ${totalTracks}
                             open ${pluralize('track', totalTracks)}`}
                          />
                        </ListItem>
                      )
                    }
                    return null
                  },
                )
              ) : (
                <Typography className={classes.message}>
                  No saved sessions found
                </Typography>
              )}
            </List>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button
            color="secondary"
            variant="contained"
            onClick={() => {
              onClose(false)
            }}
          >
            Return
          </Button>
        </DialogActions>
      </Dialog>
    )
  },
)

export default SetDefaultSession
