import React from 'react';
import PropTypes from 'prop-types';
import { IconButton } from '../mui';
import { ArrowBackIcon, FlashOnIcon, SettingsIcon, HomeIcon } from '../icons';
import { useCoreState, updatePanel, previousPanel, Panels, reset as resetCoreState } from '../state/core';
import { reset as resetConfigureState } from '../state/configure';
import { tooltipped } from '../utils';

export function BackButton() {
  return tooltipped(
    'Back',
    <IconButton onClick={() => previousPanel()}>
      <ArrowBackIcon fontSize="small" />
    </IconButton>
  );
}

export function QuickFlashButton() {
  const [activePanel] = useCoreState('panel');

  return tooltipped(
    'Quick Flash',
    <IconButton disabled={activePanel === Panels.Flash} onClick={() => updatePanel(Panels.Flash)}>
      <FlashOnIcon fontSize="small" />
    </IconButton>
  );
}

export function SettingsButton(props) {
  const { disabled } = props;
  const [activePanel] = useCoreState('panel');

  return tooltipped(
    'Settings',
    <IconButton disabled={!!disabled || activePanel === Panels.Settings} onClick={() => updatePanel(Panels.Settings)}>
      <SettingsIcon fontSize="small" />
    </IconButton>
  );
}

SettingsButton.propTypes = {
  disabled: PropTypes.bool
};

export function HomeButton(props) {
  const { disabled } = props;
  const [activePanel] = useCoreState('panel');

  const navHome = () => {
    updatePanel(Panels.KeyboardSelect);
    resetCoreState();
    resetConfigureState();
  };

  return tooltipped(
    'Home',
    <IconButton disabled={!!disabled || activePanel === Panels.KeyboardSelect} onClick={navHome}>
      <HomeIcon fontSize="small" />
    </IconButton>
  );
}

HomeButton.propTypes = {
  disabled: PropTypes.bool
};
