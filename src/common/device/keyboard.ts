import { Keyboard, KnownDevice, UsbIdentifier } from './types';

export enum Names {
  Fokal = 'Azio Fokal'
}

export enum Variants {
  Default = 'Default',
  Standard = 'Standard'
}

export const released = [Names.Fokal];

function buildKeyboardList(): Keyboard[] {
  function layouts(...layouts: [string, string[]][]): Dictionary<string[]> {
    return layouts.reduce((o, [v, ls]) => {
      o[v] = ls;
      return o;
    }, {} as Dictionary<string[]>);
  }

  return [
    {
      display: Names.Fokal,
      names: ['Azio-Fokal'],
      variants: [Variants.Standard],
      visuals: true,
      layouts: layouts([Variants.Standard, ['Standard']]),
      info: {}
    }
  ];
}

type VarDef = [number, boolean, Names[], Variants?];

function buildDeviceList(): ReadonlyMap<number, ReadonlyMap<number, KnownDevice>> {
  // const list: (number | [number, boolean, Names[], Variants?])[][] = [
  // const list: (number | VarDef)[][] = [
  const list: { vid: number; devs: VarDef[] }[] = [
    // Un-official original I:C vid/pid combo
    {
      vid: 0x1c11,
      devs: []
    },
    // Semi-official I:C shared VID
    {
      vid: 0x1209,
      devs: []
    },
    // Official I:C VID with unique PIDs
    {
      vid: 0x308f,
      devs: []
    }
  ];

  function device(
    vid: number,
    pid: number,
    isFlashable: boolean,
    names: Names[],
    variant: Optional<Variants>
  ): KnownDevice {
    return Object.freeze({
      vid,
      pid,
      isFlashable: isFlashable || false,
      isUnique: names.length === 1,
      names,
      variant
    });
  }

  function devices(vid: number, ...devices: VarDef[]): [number, ReadonlyMap<number, KnownDevice>] {
    return [vid, new Map(devices.map(b => [b[0], device(vid, ...b)]))];
  }

  return new Map(list.map(x => devices(x.vid, ...x.devs)));
}

export const keyboards = buildKeyboardList();

export const usbDevices = buildDeviceList();

export function getDevice({ vendorId, productId }: UsbIdentifier): Optional<KnownDevice> {
  const vend = usbDevices.get(vendorId);
  return vend ? vend.get(productId) : undefined;
}

export function isKnownDevice(device: Optional<UsbIdentifier>): boolean {
  return !!device && !!getDevice(device);
}
