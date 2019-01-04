import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import _ from 'lodash';
import { withStyles, Typography, FormControl, InputLabel, Select, MenuItem, TextField, Button } from '../../mui';
import { useConfigureState } from '../../state/index';
import { SwatchedChromePicker } from '../../common';
import { framesToString, Injection } from '../../../common/config';
import { process } from './canned';
import log from 'loglevel';
import { addAnimation, updateCustomKll, setSelectedAnimation, setAnimationData } from '../../state/configure';
import { popupToast } from '../../state/core';
import { SuccessToast } from '../../toast';

/** @type {import('../../theme').CssProperties} */
const styles = {
  container: {
    padding: 10
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 20,
    '&.centered': {
      alignItems: 'center'
    }
  },
  animationSelect: {
    minWidth: '20rem',
    marginRight: '2rem'
  },
  customizations: {
    marginTop: 10
  },
  animationName: {
    minWidth: '20rem',
    marginRight: '2rem'
  },
  descr: {
    fontStyle: 'oblique'
  },
  label: {
    marginRight: 10,
    fontSize: '1.25rem'
  },
  customSelect: {
    minWidth: '10rem',
    marginTop: 5
  },
  customSelectInput: {
    fontSize: '1.25rem',
    paddingLeft: 10
  }
};

function CustomizeCanned(props) {
  const { classes } = props;
  const [canned] = useConfigureState('canned');
  const [animations] = useConfigureState('animations');
  const [customKll] = useConfigureState('custom');
  const [active] = useConfigureState('selectedAnimation');
  /** @type {[Object, React.Dispatch<React.SetStateAction<Object>>]} */
  const [data] = useConfigureState('animationData');

  const validateName = name => {
    const rx = /^[A-Za-z_][A-Za-z0-9_]*$/;
    if (!name || !name.length || !rx.test(name)) {
      return 'Invalid name - valid characters [A-Za-z0-9_] must not start with number';
    }
  };

  const changeActive = name => {
    const initial = { name: name, can: name };
    canned[name].configurable.map(item => (initial[item.name] = item.default));
    setSelectedAnimation(name);
    setAnimationData(initial);
  };

  const update = (name, value) => {
    setAnimationData(curr => ({ ...curr, ...{ [name]: value } }));
  };

  const can = active ? canned[active] : undefined;

  const error = data && validateName(data.name);

  const edit = !!animations[data.name];

  const create = () => {
    const frames = can.frames.map(f => process(can.configurable, data, f, can.version));
    const settings = process(can.configurable, data, can.settings, can.version);
    const name = data.name;

		//delete data['name'];

    /** @type {Partial<import('../../../common/config/types').ConfigAnimation>} */
    const animation = {
      frames: framesToString(frames),
      settings,
      data: data
    };

    log.debug(animation);

    addAnimation(name, 'canned', animation);
    if (can['custom-kll'] && can['custom-kll'].length) {
      const inj = Injection.animation;
      // TODO: target layer for injection
      const kll = process(can.configurable, data, can['custom-kll'], can.version);
      const addition = `${inj.start}${kll}${inj.end}`.replace(inj.tokenRx, data.name);
      updateCustomKll((customKll['0'] || '') + addition, 0);
    }

    if (!edit) {
      setSelectedAnimation('');
      setAnimationData({});
      popupToast(<SuccessToast message={`Successfully added animation '${name}'`} onClose={() => popupToast(null)} />);
    }
  };

  return (
    <div className={classes.container}>
      {!edit && (
        <>
          <Typography variant="subtitle1">New Animation</Typography>
          <div className={classes.row}>
            <FormControl className={classes.animationSelect}>
              <InputLabel htmlFor="animation">Type</InputLabel>
              <Select
                value={active}
                onChange={e => changeActive(e.target.value)}
                inputProps={{ name: 'animation', id: 'animation' }}
              >
                {_.keys(canned).map(name => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {!!active && <Typography className={classes.descr}>{can.description}</Typography>}
          </div>
        </>
      )}
      {!!active && !!data && (
        <div className={classes.customizations}>
          <div className={classes.row}>
            {!edit && <TextField
              autoFocus={true}
              value={data.name}
              onChange={e => update('name', e.target.value)}
              label="Name to create as"
              className={classes.animationName}
              helperText={error}
              error={!!error}
            />}
            <Button color="primary" variant="contained" onClick={create} disabled={!!error}>
              {edit ? 'Update' : 'Create'}
            </Button>
          </div>
          {can.configurable.map(item => (
            <div className={classNames(classes.row, 'centered')} key={item.name}>
              <Typography variant="subtitle1" className={classes.label}>
                {item.name}:
              </Typography>
              {(() => {
                switch (item.type) {
                  case 'color':
                    return <SwatchedChromePicker color={data[item.name]} onChange={c => update(item.name, c.rgb)} />;
                  case 'select':
                    return (
                      <FormControl className={classes.customSelect}>
                        <Select
                          value={data[item.name]}
                          onChange={e => update(item.name, e.target.value)}
                          inputProps={{ name: 'animation', id: 'animation' }}
                          classes={{ select: classes.customSelectInput }}
                        >
                          {item.values.map(({ name, value }) => (
                            <MenuItem key={name} value={value}>
                              {name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    );
                }
              })()}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

CustomizeCanned.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(CustomizeCanned);
