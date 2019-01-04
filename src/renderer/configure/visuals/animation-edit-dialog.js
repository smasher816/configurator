import React from 'react';
import PropTypes from 'prop-types';
import { withStyles, Dialog, DialogContent, DialogActions, Button, Typography } from '../../mui';
//import CustomizeCanned from './customize-canned';
import { useConfigureState } from '../../state/configure';
import AnimationEdit from './animation-edit';

/** @type {import('../theme').ThemedCssProperties} */
const styles = theme => ({
  dialog: {
    fontFamily: theme.typography.fontFamily
  },
  dialogPaper: {
    minHeight: '85vh',
    maxHeight: '85vh'
  },
  dialogContentRoot: {
    display: 'flex'
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%'
  },
  header: {
    display: 'flex'
  },
  title: {
    marginRight: '2rem'
  }
});

function AnimationEditDialog(props) {
  const { classes, open, onClose } = props;
  const [active] = useConfigureState('selectedAnimation');

  console.log(active);

  return (
    <Dialog
      open={open}
      maxWidth="lg"
      fullWidth
      onClose={onClose}
      className={classes.dialog}
      classes={{ paper: classes.dialogPaper }}
    >
      <DialogContent classes={{ root: classes.dialogContentRoot }}>
        <div className={classes.container}>
          <div className={classes.header}>
            <Typography variant="h5" className={classes.title}>
              Select Action to Assign
            </Typography>
          </div>
          <AnimationEdit animation={active} />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

AnimationEditDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default withStyles(styles)(AnimationEditDialog);
