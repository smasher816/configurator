import React from 'react';
import { toggleLoading } from './core';
import { updateConfig } from './configure';
import { _currentState, updateNewerVersionAvail } from './settings';
import { updatePanel, Panels, reset as resetCoreState, popupToast } from './core';
import { reset as resetConfigureState } from './configure';
import { ErrorToast } from '../toast';
import _ from 'lodash';
import fs from 'fs';
import Bluebird from 'bluebird';
import urljoin from 'url-join';
import compareVersions from 'compare-versions';
import electron from 'electron';

const readFile = Bluebird.promisify(fs.readFile);

export { useCoreState } from './core';
export { useConfigureState } from './configure';
export { useSettingsState } from './settings';

function resetConfig() {
  updatePanel(Panels.KeyboardSelect);
  resetCoreState();
  resetConfigureState();
}

export async function loadDefaultConfig(keyboard, variant) {
  const recentDls = _currentState('recentDls');
  const recent = _.head(recentDls[`${keyboard.keyboard.display}__${variant}`] || []);

  if (!keyboard.keyboard.programmable) return {};

  if (recent && fs.existsSync(recent.json)) {
    return loadLocalConfig(recent.json);
  }

  return loadRemoteConfig(keyboard, variant);
}

/**
 * @param {*} keyboard
 * @param {string} variant
 * @param {string} layout
 * @param {string} baseUri
 * @param {string} locale
 */
export async function loadRemoteConfig(keyboard, variant, layout = undefined, baseUri = undefined, locale = undefined) {
  try {
    const defLayout = keyboard.keyboard.layouts[variant][0];
    const uri = urljoin(
      baseUri || _currentState('uri'),
      'layouts',
      `${keyboard.keyboard.names[0]}-${layout || defLayout}.json`
    );
    toggleLoading();
    const config = await fetch(uri).then(resp => resp.json());
    updateConfig(config, locale || _currentState('locale'));
    toggleLoading();
  } catch (e) {
    resetConfig();
    popupToast(<ErrorToast message={<span>Failed to load layout</span>} onClose={() => popupToast(null)} />);
  }
}

/**
 * @param {string} filepath
 * @param {string} locale
 */
export async function loadLocalConfig(filepath, locale = undefined) {
  try {
    toggleLoading();
    const buffer = await readFile(filepath);
    const config = JSON.parse(buffer.toString('utf8'));
    updateConfig(config, locale || _currentState('locale'));
    toggleLoading();
  } catch (e) {
    resetConfig();
    popupToast(<ErrorToast message={<span>Failed to load layout</span>} onClose={() => popupToast(null)} />);
  }
}

export async function checkVersion() {
  const now = Date.now();
  const lastCheck = _currentState('lastVersionCheck');
  if (now - lastCheck < 86400000) {
    return;
  }

  const uri = 'https://api.github.com/repos/kiibohd/configurator/releases/latest';
  const response = await fetch(uri, {
    method: 'GET',
    headers: {
      'User-Agent': 'Kiibohd Configurator',
      Accept: 'application/json; charset=utf-8'
    }
  }).then(r => r.json());

  const version = electron.remote.app.getVersion();
  const latest = response.tag_name;
  const newerAvail = compareVersions(latest, version) > 0;
  updateNewerVersionAvail(newerAvail);
  if (newerAvail) {
    return {
      version: latest,
      url: response.html_url
    };
  }
}

export async function checkFirmwareVersions() {
  const baseUri = _currentState('uri');

  const uri = urljoin(baseUri, 'versions');
  /** @type {import('../../common/config/types').FirmwareVersions} */
  const response = await fetch(uri, {
    method: 'GET',
    headers: {
      'User-Agent': 'Kiibohd Configurator',
      Accept: 'application/json; charset=utf-8'
    }
  }).then(r => r.json());

  return response;
}
