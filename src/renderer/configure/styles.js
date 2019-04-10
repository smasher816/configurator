export const Palette = {
  navy: '#001f3f',
  blue: '#0074D9',
  aqua: '#7FDBFF',
  teal: '#39CCCC',
  olive: '#3D9970',
  green: '#2ECC40',
  lime: '#01FF70',
  yellow: '#FFDC00',
  orange: '#FF851B',
  red: '#FF4136',
  maroon: '#85144B',
  fuchsia: '#F012BE',
  purple: '#B10DC9',
  black: '#111111',
  gray: '#AAAAAA',
  silver: '#DDDDDD',
  darkgray: '#444444',
  lightgray: '#fcfcfc',
  lightpurple: '#a18fff',
  white: '#ffffff'
};

export const layerBg = [
  Palette.lightgray,
  Palette.blue,
  Palette.green,
  Palette.orange,
  Palette.purple,
  Palette.teal,
  Palette.fuchsia,
  Palette.red
];

export const layerFg = [Palette.white, ...layerBg.slice(1)];

export function getLayerBg(layer) {
  return layerBg[layer] || Palette.black;
}

export function getLayerFg(layer) {
  return layerFg[layer] || Palette.white;
}

/** @type {import("../theme").CssProperties} */
export const capStyle = {
  key: {
    position: 'absolute',
    overflow: 'hidden',
    boxSizing: 'content-box'
  },
  base: {
    margin: 2
  },
  cap: {
    cursor: 'pointer',
    backgroundColor: '#555555', //Palette.lightgray,
    margin: 2,
    marginBottom: 4,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  label: {
    fontSize: 13,
    fontWeight: 300,
    marginTop: '0.15em',
    height: 14,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    userSelect: 'none',
    '& span': {
      padding: '0 0.25em'
    }
  }
};
