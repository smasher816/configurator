import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '../mui';
import { useConfigureState } from '../state';
import { Palette, getLayerFg } from './styles';

const tabHeight = 35;

/** @type {import('../theme').CssProperties} */
const styles = {
  navTabs: {
    display: 'block',
    height: tabHeight + 1,
    listStyleType: 'none',
    marginBottom: 0,
    borderBottom: '1px solid transparent',
    '-webkitPaddingStart': 0,
    clear: 'both',

    '& li': {
      cursor: 'pointer',
      display: 'block',
      float: 'left',
      backgroundColor: Palette.darkgray,
      height: `${tabHeight}px`,
      lineHeight: `${tabHeight}px`,
      padding: '0 10px',
      marginRight: '5px',
      border: '1px solid',
      borderBottomColor: Palette.darkgray,
      borderRadius: '4px 4px 0 0',
      minWidth: '4.25em',
      marginBottom: '-1px'
    },

    '& li span': {
      display: 'table',
      margin: '0 auto'
    }
  },
  inactiveTab: {
    borderColor: 'transparent !important',
    backgroundColor: 'transparent !important',
    borderBottomLeftRadius: 1,
    borderBottomRightRadius: 1
  }
};

function LayerSelect(props) {
  const { classes } = props;
  const [layer, setLayer] = useConfigureState('layer');
  const layers = [0, 1, 2, 3, 4, 5, 6, 7];

  return (
    <ul className={classes.navTabs} style={{ borderColor: getLayerFg(layer) }}>
      {layers.map(i => (
        <li
          key={i}
          className={classNames({ [classes.inactiveTab]: i !== layer })}
          style={{ color: getLayerFg(i) }}
          onClick={() => setLayer(i)}
        >
          <span>{i === 0 ? 'Base' : `Layer ${i}`}</span>
        </li>
      ))}
    </ul>
  );
}

LayerSelect.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(LayerSelect);
