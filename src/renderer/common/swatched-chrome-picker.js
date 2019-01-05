import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles, Typography } from '../mui';
import { ChromePicker } from 'react-color';
import { contrastRatio } from '../../common/utils';

const white = { r: 0xf0, g: 0xf0, b: 0xf0 };
const black = { r: 0x10, g: 0x10, b: 0x10 };

function toHex(d) {
  return ('0' + Number(d).toString(16)).slice(-2).toLowerCase();
}

/** @type {import('../theme').ThemedCssProperties} */
const styles = theme => ({
  container: {},
  swatch: {
    display: 'inline-block'
  },
  selectable: {
    cursor: 'pointer'
  },
  color: {
    width: 221,
    height: 48,
    border: `2px solid ${theme.palette.secondary.contrastText}`,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around'
  },
  popup: {
    position: 'absolute',
    zIndex: 2
  },
  cover: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  }
});

function SwatchedChromePicker(props) {
  const { classes, color, onChange, onChangeComplete, disabled } = props;
  const [showPicker, setShowPicker] = useState(false);

  const colorPreview = color || { r: 255, g: 255, b: 255 };
  const cb = contrastRatio(colorPreview, black);
  const cw = contrastRatio(colorPreview, white);

  const text = cb > cw ? black : white;

  const swatchStyle = {
    background: color ? `rgb(${color.r}, ${color.g}, ${color.b})` : 'transparent',
    borderRadius: showPicker ? '10px 10px 0 0' : 10
  };

  const textStyle = {
    fontSize: 'x-large',
    fontWeight: 900,
    color: `rgb(${text.r}, ${text.g}, ${text.b})`
  };

  return (
    <div className={classes.container}>
      <div
        className={classNames(classes.swatch, { [classes.selectable]: !disabled })}
        onClick={() => setShowPicker(!showPicker)}
      >
        <div style={swatchStyle} className={classes.color}>
          {!color && <Typography style={textStyle}>Unset</Typography>}
          {color && <Typography style={textStyle}>#{toHex(color.r) + toHex(color.g) + toHex(color.b)}</Typography>}
        </div>
      </div>
      {showPicker && (
        <div className={classes.popup}>
          <div className={classes.cover} onClick={() => setShowPicker(false)} />
          <ChromePicker
            disableAlpha={true}
            color={colorPreview}
            onChange={onChange}
            onChangeComplete={onChangeComplete}
          />
        </div>
      )}
    </div>
  );
}

SwatchedChromePicker.propTypes = {
  classes: PropTypes.object.isRequired,
  color: PropTypes.object,
  onChange: PropTypes.func,
  onChangeComplete: PropTypes.func,
  disabled: PropTypes.bool
};

export default withStyles(styles)(SwatchedChromePicker);
