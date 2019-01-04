import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '../mui';
import { CodeIcon, TuneIcon, VariableIcon, MagnifyIcon } from '../icons';
import { AnimationIcon, PaletteAdvancedIcon } from '../icons';
import { useConfigureState, useCoreState } from '../state';
import LayerSelect from './layer-select';
import OnScreenKeyboard from './onscreen-keyboard';
import KeyInfo from './key-info';
import CustomKll from './custom-kll';
import AdvancedSettings from './advanced-settings';
import AnimationList from './visuals/animation-list';
import CustomizeCanned from './visuals/customize-canned';
import SideTabs from './side-tabs';
import { LayerMacros } from './macros';
import { tooltipped } from '../utils';
import { ToggleVisualsButton, CompileFirmwareButton } from './buttons';

const tabs = [
  {
    id: 'tab/key-info',
    icon: tooltipped('Key Info', <MagnifyIcon fontSize="large" />),
    tab: <KeyInfo />
  },
  {
    id: 'tab/macros',
    icon: tooltipped('Macros', <VariableIcon fontSize="large" />),
    tab: <LayerMacros />
  },
  {
    id: 'tab/customize-canned',
    icon: tooltipped('New Animation', <PaletteAdvancedIcon fontSize="large" />),
    tab: <CustomizeCanned />
  },
  {
    id: 'tab/animations',
    icon: tooltipped('Animations Overview', <AnimationIcon fontSize="large" />),
    tab: <AnimationList />
  }
];

const tabsRight = [
  {
    id: 'tab/custom-kll',
    icon: tooltipped('Custom KLL', <CodeIcon fontSize="large" />),
    tab: <CustomKll />
  },
  {
    id: 'tab/settings',
    icon: tooltipped('Advanced Settings', <TuneIcon fontSize="large" />),
    tab: <AdvancedSettings />
  }
];

/** @type {import('../theme').CssProperties} */
const styles = {
  hidden: {
    display: 'none'
  },
  container: {
    position: 'relative',
    minHeight: 24,
    marginTop: 16
  }
};

function ConfigureKeys(props) {
  const { classes } = props;
  const [keyboard] = useCoreState('keyboard');
  const [keyboardHidden] = useConfigureState('keyboardHidden');

  return (
    <>
      <div className={classes.container}>
        {keyboard.keyboard.visuals && !keyboardHidden && <ToggleVisualsButton />}
        <CompileFirmwareButton />
        <div className={classNames({ [classes.hidden]: keyboardHidden })}>
          <LayerSelect />
          <OnScreenKeyboard />
        </div>
      </div>
      <div>
        <SideTabs items={tabs} itemsRight={tabsRight} />
      </div>
    </>
  );
}

ConfigureKeys.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(ConfigureKeys);
