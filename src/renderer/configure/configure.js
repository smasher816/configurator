import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '../mui';
import { updateToolbarButtons, useCoreState, Actions, Panels } from '../state/core';
import { SettingsButton, HomeButton } from '../buttons';
import {
  HelpButton,
  ToggleKeyboardButton,
  ViewRawJsonButton,
  ImportKeymapButton,
  LayoutHistoryButton
} from './buttons';
import ConfigureKeys from './configure-keys';
import ConfigureVisuals from './configure-visuals';

/** @type {import('../theme').CssProperties} */
const styles = {
  root: {
    boxSizing: 'content-box',
    display: 'inline-block'
  }
};

function Configure(props) {
  const { classes } = props;
  const [activePanel] = useCoreState('panel');
  const [executing] = useCoreState('executing');

  const compiling = executing.includes(Actions.Compile);

  useEffect(
    () => {
      updateToolbarButtons(
        <>
          <LayoutHistoryButton disabled={compiling} />
          <ToggleKeyboardButton />
          <HelpButton />
          <ViewRawJsonButton disabled={compiling} />
          <ImportKeymapButton disabled={compiling} />
          <SettingsButton disabled={compiling} />
          <HomeButton disabled={compiling} />
        </>
      );
    },
    [executing]
  );

  return (
    <div className={classes.root}>
      {activePanel === Panels.ConfigureKeys ? <ConfigureKeys /> : <ConfigureVisuals />}
    </div>
  );
}

Configure.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Configure);
