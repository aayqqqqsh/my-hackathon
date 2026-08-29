/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DeviceHitboxConfig {
  id: string;
  name: string;
  roomKey: string;
  propKey: string;
  type: 'light' | 'door' | 'window';
  position: [number, number, number];
  hitboxSize?: [number, number, number];
  lightColor?: string;
  maxIntensity?: number;
  lightDistance?: number;
  lightDecay?: number;
  description?: string;
}

/**
 * Default hitbox coordinates calibrated for the house model.
 * In Position Mode (Dev Mode), coordinates can be adjusted, selected, and copied.
 */
export const DEFAULT_DEVICE_HITBOXES: DeviceHitboxConfig[] = [
  // 1. Living Room
  {
    id: 'livingRoomLight',
    name: 'Living Room Light',
    roomKey: 'livingRoom',
    propKey: 'fanPower', // or general ambient illumination
    type: 'light',
    position: [0.0, 2.8, 2.2],
    hitboxSize: [1.2, 0.8, 1.2],
    lightColor: '#ffeaad',
    maxIntensity: 3.2,
    lightDistance: 8.5,
    description: 'Central living room chandelier and ambient lighting',
  },
  {
    id: 'mainDoor',
    name: 'Front Main Door',
    roomKey: 'livingRoom',
    propKey: 'mainDoorOpen',
    type: 'door',
    position: [0.0, 1.1, 5.2],
    hitboxSize: [1.4, 2.4, 0.6],
    description: 'Exterior front entryway security door',
  },

  // 2. Master Bedroom
  {
    id: 'bedroomMainLight',
    name: 'Master Bed Light',
    roomKey: 'bedroomMain',
    propKey: 'lightPower',
    type: 'light',
    position: [-4.2, 2.6, 2.4],
    hitboxSize: [1.2, 0.8, 1.2],
    lightColor: '#ffe4b5',
    maxIntensity: 3.0,
    lightDistance: 7.5,
    description: 'Primary bedroom ceiling fixture',
  },

  // 3. Bedroom 2 (Guest / Kids)
  {
    id: 'bedroom2Light',
    name: 'Bedroom 2 Light',
    roomKey: 'bedroom2',
    propKey: 'lightPower',
    type: 'light',
    position: [-4.2, 2.6, -2.4],
    hitboxSize: [1.2, 0.8, 1.2],
    lightColor: '#ffd89b',
    maxIntensity: 2.8,
    lightDistance: 7.0,
    description: 'Bedroom 2 ambient fixture',
  },

  // 4. Bedroom 3 (Study / Studio)
  {
    id: 'bedroom3Light',
    name: 'Bedroom 3 Light',
    roomKey: 'bedroom3',
    propKey: 'lightPower',
    type: 'light',
    position: [4.2, 2.6, -2.4],
    hitboxSize: [1.2, 0.8, 1.2],
    lightColor: '#ffe8c2',
    maxIntensity: 2.8,
    lightDistance: 7.0,
    description: 'Bedroom 3 studio lighting',
  },

  // 5. Dining Room
  {
    id: 'diningRoomLight',
    name: 'Dining Chandelier',
    roomKey: 'diningRoom',
    propKey: 'lightPower',
    type: 'light',
    position: [2.5, 2.8, 1.8],
    hitboxSize: [1.2, 0.8, 1.2],
    lightColor: '#ffebb0',
    maxIntensity: 3.5,
    lightDistance: 8.0,
    description: 'Dining table pendant lighting',
  },

  // 6. Kitchen
  {
    id: 'kitchenLight',
    name: 'Kitchen Lights',
    roomKey: 'kitchen',
    propKey: 'chimneyPower',
    type: 'light',
    position: [4.2, 2.7, 2.0],
    hitboxSize: [1.2, 0.8, 1.2],
    lightColor: '#ffffff',
    maxIntensity: 3.2,
    lightDistance: 7.5,
    description: 'Kitchen prep and task lighting',
  },
  {
    id: 'kitchenWindow',
    name: 'Kitchen Window',
    roomKey: 'kitchen',
    propKey: 'windowOpen',
    type: 'window',
    position: [5.4, 1.8, 2.2],
    hitboxSize: [0.6, 1.4, 1.8],
    description: 'Exterior kitchen sliding window vent',
  },

  // 7. Main Bathroom
  {
    id: 'bathroomMainLight',
    name: 'Main Bathroom Light',
    roomKey: 'bathroomMain',
    propKey: 'lightPower',
    type: 'light',
    position: [-1.8, 2.5, -3.2],
    hitboxSize: [1.0, 0.8, 1.0],
    lightColor: '#f0f4ff',
    maxIntensity: 2.5,
    lightDistance: 6.0,
    description: 'Main bath vanity and ceiling fixture',
  },

  // 8. Guest Bathroom 2
  {
    id: 'bathroom2Light',
    name: 'Bathroom 2 Light',
    roomKey: 'bathroom2',
    propKey: 'lightPower',
    type: 'light',
    position: [1.8, 2.5, -3.2],
    hitboxSize: [1.0, 0.8, 1.0],
    lightColor: '#f0f4ff',
    maxIntensity: 2.5,
    lightDistance: 6.0,
    description: 'En-suite bath illumination',
  },

  // 9. Garage
  {
    id: 'garageDoor',
    name: 'Garage Roll-Up Door',
    roomKey: 'garage',
    propKey: 'garageDoorOpen',
    type: 'door',
    position: [5.2, 1.3, -4.6],
    hitboxSize: [3.2, 2.4, 0.6],
    description: 'Motorized perimeter roll-up garage door',
  },
];
