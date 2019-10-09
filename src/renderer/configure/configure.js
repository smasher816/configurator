import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '../mui';
import { updateToolbarButtons, useCoreState, Actions, Panels } from '../state/core';
import { SettingsButton, HomeButton, HelpButton } from '../buttons';
import {
  ToggleKeyboardButton,
  ToggleVisualsButton,
  ViewRawJsonButton,
  ImportKeymapButton,
  LayoutHistoryButton,
  DownloadPackageButton
} from './buttons';
import ConfigureKeys from './configure-keys';
import ConfigureVisuals from './configure-visuals';
import { pathToImg } from '../common';

/** @type {import('../theme').CssProperties} */
const styles = {
  root: {
    boxSizing: 'content-box',
    display: 'inline-block'
  }
};

function Configure(props) {
  const { classes } = props;
  const [keyboard] = useCoreState('keyboard');
  const [activePanel] = useCoreState('panel');
  const [executing] = useCoreState('executing');

  const compiling = executing.includes(Actions.Compile);

  useEffect(() => {
    updateToolbarButtons(
      <>
        <LayoutHistoryButton disabled={compiling} />
        {keyboard.keyboard.visuals && <ToggleVisualsButton />}
        <ToggleKeyboardButton />
        <ViewRawJsonButton disabled={compiling} />
        <ImportKeymapButton disabled={compiling} />
        <SettingsButton disabled={compiling} />
        <HelpButton disabled={compiling} />
        <HomeButton disabled={compiling} />
      </>
    );
  }, [executing]);

  if (keyboard.keyboard.display == 'Hexgears GM107') {
    return (
      <>
        <div className={classes.container}>
          <DownloadPackageButton
            text="Download firmware"
            url="https://github.com/hexgears/Software/raw/master/Hexgears_Setup_V1.0.4.zip"
          />
          <div className={classes.imageContainer}>
            <img className={classes.image} src={pathToImg('img/gm107.png')} />
          </div>
        </div>
      </>
    );
  }

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
