import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import ChildProcess from 'child_process';
import electron from 'electron';
import _ from 'lodash';
import { useConnectedKeyboards } from '../hooks';
import { withStyles, deepOrange, Button, Grid, IconButton, InputAdornment, TextField, Typography } from '../mui';
import { FolderOpen } from '../icons';
import { updateToolbarButtons, updatePanel, Panels, popupToast } from '../state/core';
import { useSettingsState, updateDfu } from '../state/settings';
import { SuccessToast, ErrorToast } from '../toast';
import { BackButton, SettingsButton, HomeButton } from '../buttons';

//@ts-ignore
const staticDir = __static;

/** @type {import('../theme').ThemedCssProperties} */
const styles = theme => ({
  text: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    marginTop: 16
  },
  resizeFont: {
    fontSize: 13
  },
  icon: {
    marginRight: -12
  },
  buttonGrid: {
    marginTop: 12,
    height: 49
  },
  button: {
    height: 49,
    width: 100
  },
  hintText: {
    '&&': {
      color: deepOrange[300]
    }
  },
  warn: {
    fontStyle: 'oblique',
    color: 'red'
  },
  success: {
    fontStyle: 'oblique',
    color: 'green'
  }
});

function Flash(props) {
  const { classes } = props;
  const connected = useConnectedKeyboards();
  const [lastDl] = useSettingsState('lastDl');
  const bin = lastDl ? (_.isString(lastDl.bin) ? lastDl.bin : lastDl.bin.left) : '';
  const board = lastDl ? lastDl.board : undefined;
  const [dfuPath] = useSettingsState('dfu');
  const [binPath, setBinPath] = useState(bin);
  const [progress, setProgress] = useState('');
  const progressTextBox = useRef(null);

  useEffect(() => {
    updateToolbarButtons(
      <>
        <BackButton />
        <SettingsButton />
        <HomeButton />
      </>
    );
  }, []);

  useLayoutEffect(updateScroll, [progress]);

  let found = connected.find(x => x.known.names.some(n => n == board));

  let error = null;
  if (!found) {
    error = (
      <Grid container direction="column">
        <Grid container item xs={12} direction="row" justify="space-between" alignItems="center">
          <Grid item xs={5}>
            <Typography variant="subtitle2" className={classes.warn}>
              No keyboard found. Please connect your {board}.
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    );
  } else if (!found.known.isFlashable) {
    let resetCombo = null;
    if (board == 'Kira') {
      resetCombo = '"Right Ctrl + Right Alt + Esc"';
    } else {
      resetCombo = '"Fn + Esc"';
    }

    error = (
      <Grid container direction="column">
        <Grid container item xs={12} direction="row" justify="space-between" alignItems="center">
          <Grid item xs={5}>
            <img className={classes.image} src={`file:${staticDir}/img/reset-button.png`} style={{ width: '100%' }} />
          </Grid>
        </Grid>
        <Grid container item xs={12} direction="row" justify="space-between" alignItems="center">
          <Grid item xs={5}>
            <Typography variant="subtitle2" className={classes.warn}>
              Press the reset button on the bottom of your keyboard to enter flash mode.
            </Typography>
            {resetCombo && <Typography variant="subtitle2">Pressing {resetCombo} may also work.</Typography>}
          </Grid>
        </Grid>
        <br />
      </Grid>
    );
  } else if (!dfuPath) {
    error = (
      <Grid container direction="column">
        <Grid container item xs={12} direction="row" justify="space-between" alignItems="center">
          <Grid item xs={5}>
            <Typography variant="subtitle2" className={classes.warn}>
              Please specify the location of dfu-util.
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    );
  } else if (!binPath) {
    error = (
      <Grid container direction="column">
        <Grid container item xs={12} direction="row" justify="space-between" alignItems="center">
          <Grid item xs={5}>
            <Typography variant="subtitle2" className={classes.warn}>
              Please specify a file to flash.
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    );
  }

  return (
    <div>
      <Typography variant="subtitle1">Flash Firmware</Typography>
      {error}
      <Grid container spacing={8} direction="column">
        {found && found.known.isFlashable && (
          <Grid container item xs={12} direction="row" justify="space-between" alignItems="center">
            <Grid item xs={5}>
              <Typography variant="subtitle2" className={classes.success}>
                Found {found.keyboard.display} in flash mode.
              </Typography>
            </Grid>
          </Grid>
        )}
        <Grid container item xs={12} direction="row" justify="space-between" alignItems="center">
          <Grid item xs>
            <TextField
              fullWidth
              label="dfu-util command"
              value={dfuPath}
              onChange={e => updateDfu(e.target.value)}
              margin="dense"
              variant="outlined"
              className={classes.text}
              required
              error={!dfuPath}
              InputProps={{
                classes: { input: classes.resizeFont },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      className={classes.icon}
                      onClick={() =>
                        openDialog(
                          'path to dfu-util',
                          [{ name: 'All Files', extensions: ['*'] }],
                          paths => paths.length && updateDfu(paths[0])
                        )
                      }
                    >
                      <FolderOpen />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              InputLabelProps={{ classes: { root: classes.resizeFont } }}
            />
          </Grid>
          <Grid item xs={1} />
          <Grid item xs={2} className={classes.buttonGrid}>
            <Button
              variant="contained"
              color="primary"
              className={classes.button}
              onClick={flash}
              disabled={error != null}
            >
              Flash
            </Button>
          </Grid>
        </Grid>
        <Grid container item xs={12} direction="row" justify="space-between" alignItems="center">
          <Grid item xs>
            <TextField
              fullWidth
              label=".bin to flash"
              value={binPath}
              onChange={e => setBinPath(e.target.value)}
              margin="dense"
              variant="outlined"
              required
              className={classes.text}
              // error={!!binPath.length && !binPath.endsWith('.bin')}
              helperText={binPath.length && !binPath.endsWith('.bin') ? 'does not appear to be .bin file' : null}
              error={!binPath}
              InputProps={{
                classes: { input: classes.resizeFont },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      className={classes.icon}
                      onClick={() =>
                        openDialog(
                          'firmware to flash',
                          [{ name: 'bin files', extensions: ['bin'] }],
                          paths => paths.length && setBinPath(paths[0])
                        )
                      }
                    >
                      <FolderOpen />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              InputLabelProps={{ classes: { root: classes.resizeFont } }}
            />
          </Grid>
          <Grid item xs={3} />
        </Grid>
        <Grid item xs={9}>
          <TextField
            fullWidth
            multiline
            rows="15"
            label="flashing progress"
            margin="dense"
            variant="outlined"
            className={classes.text}
            InputProps={{ inputRef: progressTextBox, readOnly: true }}
            value={progress}
          />
        </Grid>
      </Grid>
    </div>
  );

  function updateScroll() {
    if (progressTextBox) {
      progressTextBox.current.scrollTop = progressTextBox.current.scrollHeight;
    }
  }

  function openDialog(title, filters, cb) {
    electron.remote.dialog.showOpenDialog({ title, filters, properties: ['openFile'] }, cb);
  }

  function flash() {
    setProgress('');
    const cmd = ChildProcess.spawn(dfuPath, ['-D', binPath]);
    cmd.stdout.on('data', d => setProgress(curr => curr + d + '\n'));
    cmd.stderr.on('data', d => setProgress(curr => curr + 'ERROR: ' + d + '\n'));
    cmd.on('close', code => {
      setProgress(curr => curr + '\nExited with code ' + code);
      if (code == 0) {
        popupToast(<SuccessToast message={<span>Flashing Successful</span>} onClose={() => popupToast(null)} />);
        updatePanel(Panels.ConfigureKeys);
      } else {
        popupToast(<ErrorToast message={<span>Error Flashing</span>} onClose={() => popupToast(null)} />);
      }
    });
  }
}

Flash.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Flash);
