import React from 'react';
import PropTypes from 'prop-types';
import { withStyles, Button } from '../../mui';
import { BrightnessLow, BrightnessHigh } from '../../icons';
import { useCoreState, updatePanel, Panels } from '../../state/core';

/** @type {import('../../theme').ThemedCssProperties} */
const styles = theme => ({
  button: {
    color: 'rgba(0, 0, 0, 0.54)'
  },
  leftIcon: {
    marginRight: theme.spacing.unit,
    fontSize: 20
  }
});

function ToggleVisualsButton(props) {
  const { classes } = props;
  const [panel] = useCoreState('panel');
  const isVisuals = panel === Panels.ConfigureVisuals;
  const toggle = () => updatePanel(isVisuals ? Panels.ConfigureKeys : Panels.ConfigureVisuals);

  return (
    <Button className={classes.button} onClick={toggle}>
      {isVisuals ? (
        <BrightnessLow className={classes.leftIcon} />
      ) : (
        <BrightnessHigh className={classes.leftIcon} />
      )}
      {isVisuals ? 'Hide LEDs' : 'Show LEDs'}
    </Button>
  );
}

ToggleVisualsButton.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(ToggleVisualsButton);
