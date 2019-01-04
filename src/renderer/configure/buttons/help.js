import React from 'react';
import electron from 'electron';
import { IconButton } from '../../mui';
import { HelpOutlineIcon } from '../../icons';
import { tooltipped } from '../../utils';

function ToggleKeyboardButton() {
  const openHelp = () => {
    electron.shell.openExternal('https://kiibohd.github.io/wiki/#/Configurator');
  };

  return tooltipped('Help', <IconButton onClick={openHelp}>{<HelpOutlineIcon fontSize="small" />}</IconButton>);
}

export default ToggleKeyboardButton;
