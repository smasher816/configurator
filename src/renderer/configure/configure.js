import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles, Grid } from '../mui';
import { updateToolbarButtons, useCoreState, Panels } from '../state/core';
import { SettingsButton, HomeButton } from '../buttons';
import {
  ToggleKeyboardButton,
  CompileFirmwareButton,
  ToggleVisualsButton,
  ViewRawJson,
  ImportKeymap,
  LayoutHistoryButton
} from './buttons';
import ConfigureKeys from './configure-keys';
import ConfigureVisuals from './configure-visuals';

const styled = withStyles({
  root: {
    boxSizing: 'content-box',
    display: 'inline-block'
  }
});

function Configure(props) {
  const { classes } = props;
  const [keyboard] = useCoreState('keyboard');
  const [activePanel] = useCoreState('panel');

  useEffect(() => {
    updateToolbarButtons(
      <>
        <LayoutHistoryButton />
        {keyboard.keyboard.visuals && <ToggleVisualsButton />}
        <ToggleKeyboardButton />
        <ViewRawJson />
        <ImportKeymap />
        
        <SettingsButton />
        <HomeButton />
      </>
    );
  }, []);

  return (
    <div className={classes.root}>
	  <Grid container item xs={12} direction="row" justify="space-between" alignItems="center">
		<Grid item xs={1} />
		<Grid item xs={2} className={classes.buttonGrid}>
		  <CompileFirmwareButton />
		</Grid>
	   </Grid>
      {activePanel === Panels.ConfigureKeys ? <ConfigureKeys /> : <ConfigureVisuals />}
    </div>
  );
}

Configure.propTypes = {
  classes: PropTypes.object.isRequired
};

export default styled(Configure);
