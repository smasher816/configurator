import React, { useEffect } from 'react';
import { MuiThemeProvider } from './mui';
import theme from './theme';
import { checkVersion } from './state';
import AppLayout from './app-layout';
import { loadFromDb, updateDfu, updateKiidrv } from './state/settings';
import { useCoreState, popupToast, setHidio } from './state/core';
import NewVersionToast from './toast/new-version';
import { checkDfuVersion, checkKiidrvVersion } from './local-storage/utilities';
import { GenericToast } from './toast';
import { hidioConnect, getNodes } from './hidio';

async function initApp() {
  await loadFromDb();
  const newVersion = await checkVersion();
  if (newVersion) {
    popupToast(<NewVersionToast version={newVersion.version} url={newVersion.url} onClose={() => popupToast(null)} />);
  }

  const dfuUpdatedPath = await checkDfuVersion();
  if (dfuUpdatedPath) {
    updateDfu(dfuUpdatedPath);
    popupToast(
      <GenericToast
        variant="success"
        message={<span>Updated dfu-util downloaded.</span>}
        onClose={() => popupToast(null)}
      />
    );
  }

  const kiidrvUpdatedPath = await checkKiidrvVersion();
  if (kiidrvUpdatedPath) {
    updateKiidrv(kiidrvUpdatedPath);
    popupToast(
      <GenericToast
        variant="success"
        message={<span>Updated kiidrv downloaded.</span>}
        onClose={() => popupToast(null)}
      />
    );
  }

  setHidio(await hidioConnect());
}

function App() {
  useEffect(() => {
    initApp();
  }, []);

  const [hidio] = useCoreState('hidio');

  if (hidio) {
    console.log(hidio);
    let n = getNodes(hidio.instance);
    console.log(n);
    n.then(nodes => {
      console.log('f');
      console.log(nodes);
    });
  }

  return (
    <MuiThemeProvider theme={theme}>
      <AppLayout />
    </MuiThemeProvider>
  );
}

export default App;
