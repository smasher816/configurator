import React, { useState } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { withStyles } from '@material-ui/core/styles';
import { Button, Table, TableHead, TableBody, TableCell, TableRow, IconButton, Typography, grey } from '../../mui';
import { EditIcon, DeleteIcon, ToggleSwitchOutlineIcon, ToggleSwitchOffOutlineIcon } from '../../icons';
import { AlterFieldModal } from '../../modal';
import {
  useConfigureState,
  addAnimation,
  deleteAnimation,
  updateAnimation,
  setSelectedAnimation,
  setAnimationData
} from '../../state/configure';
import AnimationEditDialog from './animation-edit-dialog';

/** @type {import('../../theme').CssProperties} */
const styles = {
  container: {
    padding: 10
  },
  error: {
    fontStyle: 'oblique',
    textAlign: 'center'
  },
  startup: {
    cursor: 'pointer'
  },
  on: {
    color: 'green'
  },
  off: {
    color: grey[800]
  }
};

function AnimationList(props) {
  const { classes } = props;
  const [animations] = useConfigureState('animations');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  const startupCount = _.toPairs(animations).filter(([, x]) => {
    //console.log(x);
    return x.settings.includes('start');
  }).length;

  /** @type{(name: string, anim: import('../../../common/config/types').ConfigAnimation) => void} */
  const toggleStart = (name, anim) => {
    let settings = anim.settings.split(',').map(x => x.trim());
    if (settings.includes('start')) {
      settings = _.filter(settings, x => x !== 'start');
    } else {
      settings = [...settings, 'start'];
    }

    updateAnimation(name, { settings: settings.join(', ') });
  };

  const [showNew, setShowNew] = useState(false);
  const create = (save, name) => {
    setShowNew(false);
    if (save) {
      addAnimation(name);
      editAnimation(name);
    }
  };

  const validateName = name => {
    if (animations[name]) {
      return 'An animation already exists with that name';
    }
    const rx = /^[A-Za-z_][A-Za-z0-9_]*$/;
    if (!name.length || !rx.test(name)) {
      return 'Invalid name - valid characters [A-Za-z0-9_] must not start with number';
    }
  };

  const closeDialog = () => setAssignDialogOpen(false);
  const editAnimation = name => {
    if (animations[name].type == 'canned') {
      let data = { name, ...animations[name].data };
      setSelectedAnimation(data.can);
      setAnimationData(data);
    } else {
      setSelectedAnimation(name);
    }
    setAssignDialogOpen(true);
  };

  return (
    <div className={classes.container}>
      {startupCount > 1 && (
        <div className={classes.error}>
          <Typography color="error">Warning: Multiple startup animations specified, this may cause issues.</Typography>
        </div>
      )}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Startup Animation</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {_.toPairs(animations).map(([name, anim]) => (
            <TableRow key={name}>
              <TableCell>{name}</TableCell>
              <TableCell>
                <div onClick={() => toggleStart(name, anim)} className={classes.startup}>
                  {anim.settings.includes('start') ? (
                    <ToggleSwitchOutlineIcon fontSize="large" className={classes.on} />
                  ) : (
                    <ToggleSwitchOffOutlineIcon fontSize="large" className={classes.off} />
                  )}
                </div>
              </TableCell>
              <TableCell>
                <IconButton onClick={() => editAnimation(name)}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton onClick={() => deleteAnimation(name)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          <TableRow key={name}>
            <TableCell />
            <TableCell />
            <TableCell>
              <Button color="secondary" className={classes.actionButton} onClick={() => setShowNew(true)}>
                Add New
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <AlterFieldModal
        open={showNew}
        value={''}
        name="Animation Name"
        saveText="Create"
        onClose={create}
        validation={validateName}
      />
      <AnimationEditDialog open={assignDialogOpen} onClose={closeDialog} />
    </div>
  );
}

AnimationList.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(AnimationList);
