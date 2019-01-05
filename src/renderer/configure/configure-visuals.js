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
import _ from 'lodash';

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
  const [selectedLeds] = useConfigureState('selectedLeds');

  const ledGroups = _.get(keyboard, 'keyboard.ledGroups', []);

  const select = (selection, append) => {
    let area = [];
    switch (selection) {
      case 'none':
        area = [];
        break;
      case 'backlighting':
        area = leds.filter(x => !!x.scanCode).map(x => x.id);
        break;
      case 'underlighting':
        area = leds.filter(x => !x.scanCode).map(x => x.id);
        break;
      case 'all':
        area = leds.map(x => x.id);
        break;
      default:
        area = leds.filter(x => ledGroups[selection].includes(x.id)).map(x => x.id);
        break;
    }

    setSelectedLeds(append ? [...selectedLeds, ...area] : area);
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
            <div style={{ float: 'left' }}>
              <Button color="primary" onClick={e => select('backlighting', e.shiftKey)}>
                Backlighting
              </Button>
              <Button color="primary" onClick={e => select('underlighting', e.shiftKey)}>
                Underlighting
              </Button>
              <Button color="primary" onClick={e => select('all', e.shiftKey)}>
                All
              </Button>
              <Button color="primary" onClick={e => select('none', e.shiftKey)}>
                None
              </Button>
            </div>
            <div style={{ float: 'right' }}>
              {Object.keys(ledGroups).map(group => (
                <Button color="primary" onClick={e => select(group, e.shiftKey)} key={group}>
                  {group}
                </Button>
              ))}
            </div>
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
