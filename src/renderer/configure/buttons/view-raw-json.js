import React, { useState } from 'react';
import electron from 'electron';
import fs from 'fs';
import PropTypes from 'prop-types';
import { Button, IconButton } from '../../mui';
import { JsonIcon } from '../../icons';
import { tooltipped } from '../../utils';
import { SimpleDataModal } from '../../modal';
import { SuccessToast, ErrorToast } from '../../toast';
import { popupToast } from '../../state/core';
import { currentConfig } from '../../state/configure';

function ViewRawJsonButton(props) {
  const { disabled } = props;
  const [data, setData] = useState(null);

  const loadData = () => setData(JSON.stringify(currentConfig(), null, 2));

  const button = tooltipped(
    'View Raw JSON',
    <IconButton onClick={loadData} disabled={!!disabled}>
      <JsonIcon fontSize="small" />
    </IconButton>
  );

  const copyJson = () => {
    electron.clipboard.writeText(data);
    popupToast(<SuccessToast message={<span>Copied to Clipoard</span>} onClose={() => popupToast(null)} />);
  };

  const saveDialog = () => {
    electron.remote.dialog.showSaveDialog(
      {
        defaultPath: 'configurator-export.json',
        filters: [{ name: 'JSON', extensions: ['json'] }, { name: 'All Files', extensions: ['*'] }]
      },
      filename => {
        if (filename) {
          fs.writeFile(filename, data, err => {
            if (err) {
              popupToast(
                <ErrorToast message={<span>Error saving file: ${err.message}</span>} onClose={() => popupToast(null)} />
              );
            } else {
              popupToast(<SuccessToast message={<span>Saved!</span>} onClose={() => popupToast(null)} />);
            }
          });
        }
      }
    );
  };

  const actions = [
    <Button onClick={copyJson} key="copy">
      Copy
    </Button>,
    <Button onClick={saveDialog} key="save">
      Save
    </Button>
  ];

  return (
    <div>
      {button}
      <SimpleDataModal
        open={!!data}
        onClose={() => setData(null)}
        data={data}
        actions={actions}
        title="Raw Configuration JSON"
      />
    </div>
  );
}

ViewRawJsonButton.propTypes = {
  disabled: PropTypes.bool
};

export default ViewRawJsonButton;
