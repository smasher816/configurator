import React, { useState } from 'react';
import electron from 'electron';
import fs from 'fs';
import PropTypes from 'prop-types';
import { Button, IconButton, Snackbar } from '../../mui';
import { UploadIcon } from '../../icons';
import { tooltipped } from '../../utils';
import { SimpleDataModal } from '../../modal';
import { SuccessToast, ErrorToast } from '../../toast';
import { popupToast } from '../../state/core';
import { updateConfig } from '../../state/configure';
import { useSettingsState } from '../../state/settings';

function ImportKeymapButton(props) {
  const { disabled } = props;
  const [locale] = useSettingsState('locale');
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState('');
  const [toast, setToast] = useState(null);

  function load(data) {
    const config = JSON.parse(data);
    try {
      if (!config.header) throw new Error('Invalid structure - No header property defined');
      if (!config.matrix) throw new Error('Invalid structure - No matrix property defined');
      updateConfig(config, locale);
      setVisible(false);
      return true;
    } catch (e) {
      setToast(<ErrorToast message={<span>Error Parsing: {e.message}</span>} onClose={() => setToast(null)} />);
    }
    return false;
  }

  const loadDialog = () => {
    electron.remote.dialog.showOpenDialog(
      {
        properties: ['openFile'],
        defaultPath: 'configurator-export.json',
        filters: [{ name: 'JSON', extensions: ['json'] }, { name: 'All Files', extensions: ['*'] }]
      },
      files => {
        if (files.length && files[0]) {
          fs.readFile(files[0], 'utf8', (err, data) => {
            if (err) {
              popupToast(
                <ErrorToast
                  message={<span>Error reading file: ${err.message}</span>}
                  onClose={() => popupToast(null)}
                />
              );
            } else {
              setData(data);
              if (load(data)) {
                popupToast(<SuccessToast message={<span>Loaded!</span>} onClose={() => popupToast(null)} />);
              }
            }
          });
        }
      }
    );
  };

  const actions = [
    <Snackbar key={'snackbar'} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} open={!!toast}>
      {toast}
    </Snackbar>,
    <Button key={'load'} color="primary" variant="outlined" onClick={loadDialog}>
      Load File
    </Button>,
    <Button key={'import'} onClick={() => load(data)} disabled={!data || !data.length} style={{ marginRight: 10 }}>
      Import
    </Button>
  ];

  const button = tooltipped(
    'Import Keymap',
    <IconButton onClick={() => setVisible(true)} disabled={!!disabled}>
      <UploadIcon fontSize="small" />
    </IconButton>
  );
  return (
    <div>
      {button}
      <SimpleDataModal
        open={visible}
        onClose={() => setVisible(false)}
        data={data}
        readonly={false}
        onChange={setData}
        actions={actions}
        title="Import Layout JSON"
      />
    </div>
  );
}

ImportKeymapButton.propTypes = {
  disabled: PropTypes.bool
};

export default ImportKeymapButton;
