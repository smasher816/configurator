import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles, Button } from '../mui';
import { CodeIcon, TuneIcon, VariableIcon, MagnifyIcon } from '../icons';
import { AnimationIcon, PaletteAdvancedIcon } from '../icons';
//import KeyInfo from './key-info';
import CustomKll from './custom-kll';
import AdvancedSettings from './advanced-settings';
import PresetSelect from './visuals-select';
import VisualizeLeds from './visualize-leds';
import SideTabs from './side-tabs';
import AnimationList from './visuals/animation-list';
import StaticMap from './visuals/static-map';
import { LayerMacros } from './macros';
import { tooltipped } from '../utils';
import { useConfigureState, useCoreState } from '../state';
import { setSelectedLeds } from '../state/configure';
import { ToggleVisualsButton, CompileFirmwareButton } from './buttons';
import CustomizeCanned from './visuals/customize-canned';

const tabs = [
  {
    id: 'tab/static-map',
    icon: tooltipped('Static LEDs', <MagnifyIcon fontSize="large" />),
    tab: <StaticMap />
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
  container: {
    position: 'relative',
    minHeight: 24,
    marginTop: 16
  },
  leds: {
    boxSizing: 'content-box',
    display: 'inline-block'
  },
  hidden: {
    display: 'none'
  }
};

function ConfigureVisuals(props) {
  const { classes } = props;
  const [keyboard] = useCoreState('keyboard');
  const [keyboardHidden] = useConfigureState('keyboardHidden');
  const [leds] = useConfigureState('leds');

  const select = selection => {
    switch (selection) {
      case 'none':
        setSelectedLeds([]);
        break;
      case 'backlighting':
        setSelectedLeds(leds.filter(x => !!x.scanCode).map(x => x.id));
        break;
      case 'underlighting':
        setSelectedLeds(leds.filter(x => !x.scanCode).map(x => x.id));
        break;
      case 'all':
        setSelectedLeds(leds.map(x => x.id));
        break;
    }
  };

  return (
    <>
      <div className={classes.container}>
        {keyboard.keyboard.visuals && !keyboardHidden && <ToggleVisualsButton />}
        <CompileFirmwareButton />
        <div className={classNames(classes.leds, { [classes.hidden]: keyboardHidden })}>
          <PresetSelect />
          <VisualizeLeds />
          <div className={classes.row} style={{ alignItems: 'center' }}>
            <Button color="primary" onClick={() => select('backlighting')}>
              Backlighting
            </Button>
            <Button color="primary" onClick={() => select('underlighting')}>
              Underlighting
            </Button>
            <Button color="primary" onClick={() => select('all')}>
              All
            </Button>
            <Button color="primary" onClick={() => select('none')}>
              None
            </Button>
          </div>
        </div>
      </div>
      <div>
        <SideTabs items={tabs} itemsRight={tabsRight} />
      </div>
    </>
  );
}

ConfigureVisuals.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(ConfigureVisuals);
