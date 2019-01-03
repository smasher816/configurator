import React from 'react';
import { useState } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { withStyles } from '../mui';

import { useConfigureState } from '../state';
import { getSize } from '../../common/config';
import { Palette } from './styles';

/** @type {import('../theme').ThemedCssProperties} */
const styles = theme => ({
  tabContainer: {
    float: 'left'
  },
  tabContainerRight: {
    float: 'right'
  },
  active: {
    border: '1px solid black',
    borderRightColor: theme.palette.background.default
  },
  activeRight: {
    border: '1px solid black',
    borderLeftColor: theme.palette.background.default
  },
  inactive: {
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
      borderRadius: '50%',
      cursor: 'pointer'
    }
  },
  tab: {
    textAlign: 'center',
    width: 54,
    marginBottom: 10,
    padding: '5px 0',
    borderRadius: '4px 0 0 4px',
    color: Palette.darkgray
  },
  tabRight: {
    textAlign: 'center',
    width: 54,
    marginBottom: 10,
    padding: '5px 0',
    borderRadius: '0 4px 4px 0',
    color: Palette.darkgray
  }
});

function SideTabs(props) {
  const { classes, items, itemsRight } = props;
  const [activeTab, setActiveTab] = useState(_.head(items).id);
  const [ui] = useConfigureState('ui');
  const [matrix] = useConfigureState('matrix');
  const { width } = getSize(matrix, ui.sizeFactor);

  const active = items.find(t => t.id === activeTab) || itemsRight.find(t => t.id === activeTab);

  return (
    <div>
      <div className={classes.tabContainer}>
        {items && items.map(t => (
          <div
            key={t.id}
            className={classNames(classes.tab, activeTab === t.id ? classes.active : classes.inactive)}
            onClick={() => setActiveTab(t.id)}
          >
            {t.icon}
          </div>
        ))}
      </div>
      <div className={classes.tabContainerRight}>
        {itemsRight && itemsRight.map(t => (
          <div
            key={t.id}
            className={classNames(classes.tabRight, activeTab === t.id ? classes.activeRight : classes.inactive)}
            onClick={() => setActiveTab(t.id)}
          >
            {t.icon}
          </div>
        ))}
      </div>
      <div style={{ width: width + 2 + 2 * ui.backdropPadding, marginTop: 15 }}>
        <div
          style={{
            border: '1px solid black',
            marginLeft: items ? 55 : 0,
            marginRight: itemsRight ? 55 : 0,
            paddingLeft: 20,
            minHeight: 250
          }}
        >
          {active.tab}
          <div style={{ clear: 'both', height: 14 }} />
        </div>
      </div>
    </div>
  );
}

SideTabs.propTypes = {
  classes: PropTypes.object.isRequired,
  items: PropTypes.array,
  itemsRight: PropTypes.array
};

export default withStyles(styles)(SideTabs);
