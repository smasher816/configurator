import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '../mui';
import KeyGroups from './key-groups';

const styles = {};

function Preferences(props) {
  const { classes } = props;
  const [selected] = useConfigureState('selected');
  const [layer] = useConfigureState('layer');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  console.log(selected);
  const key = selected && selected.layers[layer] && selected.layers[layer].key;
  const cap = keymap[key] || {};

  const close = () => setAssignDialogOpen(false);
  const select = key => {
    setAssignDialogOpen(false);
    updateSelected(key);
  };

  return (
    <div className={classes.balderdash}>
      <KeyGroups />
    </div>
  );
}

Preferences.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Preferences);
