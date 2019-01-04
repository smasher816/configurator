import React, { useReducer, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '../../mui';
import { Palette, getLayerFg } from '../styles';
import { getSize } from '../../../common/config';
import {
  useConfigureState,
  setConfigureState,
  addSelectedLeds,
  setSelectedLeds,
  setLedStatus,
  updateAnimation
} from '../../state/configure';
import Key from './key';
import Led from './led';
import _ from 'lodash';
// TODO: Major refactor, this is ugly right now, but it works...

/** @type {import('../../theme').CssProperties} */
const styles = {
  backdrop: {
    backgroundColor: Palette.lightgray,
    borderLeft: '1px solid black',
    borderRight: '1px solid black',
    borderBottom: '1px solid black'
  },
  innerContainer: {
    position: 'relative'
  },
  zone: {
    position: 'absolute',
    zIndex: 99,
    border: '1px solid red'
  }
};

/**
 * @typedef Point
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef Box
 * @property {number} left
 * @property {number} top
 * @property {number} width
 * @property {number} height
 */

/**
 * @typedef State
 * @property {boolean} mouseDown
 * @property {import('../../../common/config/types').ConfigLed[]} leds
 * @property {boolean} append
 * @property {Point} start
 * @property {Point} end
 * @property {Box} zone
 * @property {number[]} initialSelected
 * @property {number[]} selected
 */

/**
 * @typedef Action
 * @property {'reset'|'start'|'move'|'stop'|'click'} type
 * @property {{x: number, y: number, append?: boolean, initialSelected?: number[], leds?: import('../../../common/config/types').ConfigLed[]}} payload
 */

/** @type {State} */
const initialState = {
  mouseDown: false,
  leds: [],
  append: false,
  start: null,
  end: null,
  zone: null,
  initialSelected: [],
  selected: []
};

/**
 * @param {State} state
 * @param {Action} action
 * @returns {State}
 */
function reducer(state, action) {
  switch (action.type) {
    case 'reset':
      return initialState;
    case 'start':
      var point = { x: action.payload.x, y: action.payload.y };
      return {
        ...state,
        ...{
          mouseDown: true,
          leds: action.payload.leds,
          append: !!action.payload.append,
          start: point,
          end: point,
          initialSelected: action.payload.initialSelected
        }
      };
    case 'move':
      if (!state.mouseDown) {
        return state;
      }
      point = { x: action.payload.x, y: action.payload.y };
      var zone = {
        top: Math.min(state.start.y, point.y),
        left: Math.min(state.start.x, point.x),
        width: Math.abs(point.x - state.start.x),
        height: Math.abs(point.y - state.start.y)
      };
      var selected = state.start.y < point.y ? contained(state.leds, zone) : intersects(state.leds, zone);
      selected = state.append ? [...state.initialSelected, ...selected] : selected;
      return { ...state, ...{ end: point, zone, selected } };
    case 'stop':
      return { ...initialState, ...{ selected: state.selected } };
    case 'click':
      point = { x: action.payload.x, y: action.payload.y };
      zone = { top: point.y, left: point.x, width: 1, height: 1 };
      selected = intersects(state.leds, zone);
      selected = state.append ? [...state.initialSelected, ...selected] : selected;
      return { ...initialState, ...{ selected } };
    default:
      return state;
  }
}

/**
 * @param {import('../../../common/config/types').ConfigLed[]} leds
 * @param {Box} zone
 */
function contained(leds, zone) {
  // TODO: Dynamic && Pre-scale!!!
  const sf = 16;
  const left = zone.left;
  const top = zone.top;
  const right = zone.left + zone.width;
  const bottom = zone.top + zone.height;
  const conv = 0.20997375328084; // map 19.05mm => 4x4
  const scale = x => 2 * sf + x * conv * sf;
  return leds
    .filter(l => {
      const x = scale(l.x) - sf / 2;
      const y = scale(l.y) - sf / 2;
      return left <= x && right >= x + sf && top <= y && bottom >= y + sf;
    })
    .map(x => x.id);
}

/**
 * @param {import('../../../common/config/types').ConfigLed[]} leds
 * @param {Box} zone
 */
function intersects(leds, zone) {
  // TODO: Dynamic
  const sf = 16;
  const left = zone.left;
  const top = zone.top;
  const right = zone.left + zone.width;
  const bottom = zone.top + zone.height;
  const conv = 0.20997375328084; // map 19.05mm => 4x4
  const scale = x => 2 * sf + x * conv * sf;
  return leds
    .filter(l => {
      const x = scale(l.x) - sf / 2;
      const y = scale(l.y) - sf / 2;
      return left <= x + sf && right >= x && top <= y + sf && bottom >= y;
    })
    .map(x => x.id);
}

function VisualizeLeds(props) {
  const { classes } = props;
  const [state, dispatch] = useReducer(reducer, initialState);
  const containerRef = useRef(null);
  const [ui] = useConfigureState('ui');
  const [matrix] = useConfigureState('matrix');
  const [leds] = useConfigureState('leds');
  const [selectedLeds] = useConfigureState('selectedLeds');
  const [ledStatus] = useConfigureState('ledStatus');
  const { height, width } = getSize(matrix, ui.sizeFactor);

  const [animations] = useConfigureState('animations');
  const [preset] = useConfigureState('preset');

  const active = 'preset' + preset;
  const activeAnimation = active.length && animations[active];

  const filteredAnimations = _.toPairs(animations).filter(
    ([, x]) => x.type !== 'static' && x.settings.includes('start')
  );
  const disabled = preset == 0 && filteredAnimations.length > 0;

  /** @type {(e: React.MouseEvent, led: import('../../../common/config/types').ConfigLed) => void} */
  const click = (e, led) => {
    //TODO: only select when needed
    if (e.button !== 0) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    const append = e.ctrlKey || e.altKey || e.shiftKey;
    const bounds = containerRef.current.getBoundingClientRect();
    const x = e.pageX - bounds.left;
    const y = e.pageY - bounds.top;
    dispatch({ type: 'click', payload: { x, y, append, leds, initialSelected: selectedLeds } });
    if (e.shiftKey) {
      led && addSelectedLeds([led.id]);
    } else {
      setSelectedLeds(led ? [led.id] : []);
    }
  };

  /** @type {(e: React.MouseEvent) => void} */
  const mousedown = e => {
    if (e.button === 2 || e.nativeEvent.which === 2) {
      return;
    }
    const append = e.ctrlKey || e.altKey || e.shiftKey;
    const bounds = containerRef.current.getBoundingClientRect();
    const x = e.pageX - bounds.left;
    const y = e.pageY - bounds.top;

    dispatch({ type: 'start', payload: { x, y, append, leds, initialSelected: selectedLeds } });
  };

  /** @type {(e: MouseEvent) => void} */
  const mousemove = e => {
    e.preventDefault();
    if (state.mouseDown) {
      const bounds = containerRef.current.getBoundingClientRect();
      const x = e.pageX - bounds.left;
      const y = e.pageY - bounds.top;
      dispatch({ type: 'move', payload: { x, y } });
    }
  };

  /** @type {(e: MouseEvent) => void} */
  const mouseup = e => {
    const bounds = containerRef.current.getBoundingClientRect();
    const x = e.pageX - bounds.left;
    const y = e.pageY - bounds.top;
    dispatch({ type: 'stop', payload: { x, y } });
  };

  useEffect(
    () => {
      if (state.mouseDown) {
        window.document.addEventListener('mousemove', mousemove);
        window.document.addEventListener('mouseup', mouseup);
      }
      return () => {
        window.document.removeEventListener('mousemove', mousemove);
        window.document.removeEventListener('mouseup', mouseup);
      };
    },
    [state.mouseDown]
  );

  useEffect(
    () => {
      setSelectedLeds(state.selected);
    },
    [state.selected]
  );

  useEffect(
    () => {
      const rx = /P\[(\d+)]\(\s*(\d+)s*,\s*(\d+)s*,\s*(\d+)s*\)/gm;
      // TODO: Bulk update...
      let match;
      if (activeAnimation) {
        while ((match = rx.exec(activeAnimation.frames))) {
          const [id, r, g, b] = match.slice(1, 5).map(x => parseInt(x));
          setLedStatus(id, { id, r, g, b });
        }
      }
      return () => setConfigureState('ledStatus', {});
    },
    [active]
  );

  const backdropStyle = {
    borderColor: getLayerFg(preset),
    position: 'relative',
    height,
    width,
    padding: ui.backdropPadding,
    backgroundColor: '#DDDDDD'
  };

  const overlayStyle = {
    position: 'relative',
    margin: 'auto',
    textAlign: 'center',
    color: 'white',
    backgroundColor: '#555',
    width: 300,
    zIndex: 3,
    padding: 10
  };

  const disableLiveAnimations = () => {
    filteredAnimations.forEach(([name, anim]) => {
      let settings = anim.settings.split(',').map(x => x.trim());
      settings = _.filter(settings, x => x !== 'start');
      updateAnimation(name, { settings: settings.join(', ') });
    });
  };

  return (
    <div className={classes.backdrop} style={backdropStyle}>
      <div className={classes.innerContainer} onClick={e => click(e, null)} onMouseDown={mousedown} ref={containerRef}>
        {matrix.map(k => (
          <Key key={`key-${k.board}-${k.code}`} keydef={k} sizeFactor={ui.sizeFactor} />
        ))}
        {!disabled &&
          leds.map(led => (
            <Led
              key={`led-${led.id}`}
              led={led}
              sizeFactor={ui.sizeFactor}
              onClick={click}
              selected={selectedLeds.includes(led.id)}
              status={ledStatus[led.id]}
            />
          ))}
        {disabled && (
          <div style={overlayStyle}>
            <Typography color="inherit" variant="h6">
              Animations Enabled.
            </Typography>
            <Typography color="inherit" variant="subtitle1">
              Unable to change individual key colors.
            </Typography>
            <Button variant="contained" onClick={disableLiveAnimations}>
              Turn off
            </Button>
          </div>
        )}
        {state.zone && <div className={classes.zone} style={state.zone} />}
      </div>
    </div>
  );
}

VisualizeLeds.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(VisualizeLeds);
