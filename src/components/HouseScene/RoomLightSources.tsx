/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import type { AllRoomsState } from '../../types';

export interface RoomLightConfig {
  id: string;
  name: string;
  roomKey: keyof AllRoomsState;
  position: [number, number, number];
  color: string;
  maxIntensity: number;
  distance: number;
  decay: number;
  isOn: (state: AllRoomsState) => boolean;
}

// Calibrated light positions matching each dedicated room's 3D coordinates
export const ROOM_LIGHT_CONFIGS: RoomLightConfig[] = [
  // 1. Living Room (Center-South)
  {
    id: 'livingRoom',
    name: 'Living Room',
    roomKey: 'livingRoom',
    position: [-0.5, 2.4, 2.0],
    color: '#ffe6aa', // Warm living room ambient glow
    maxIntensity: 38.0,
    distance: 7.8,
    decay: 1.8,
    isOn: (state) =>
      !!(
        state.livingRoom.fanPower ||
        state.livingRoom.acPower ||
        state.livingRoom.mainDoorOpen
      ),
  },
  // 2. Dining Room (East-Mid-South)
  {
    id: 'diningRoom',
    name: 'Dining Room',
    roomKey: 'diningRoom',
    position: [2.8, 2.4, 2.6],
    color: '#ffeac2', // Warm dining chandelier
    maxIntensity: 35.0,
    distance: 6.8,
    decay: 1.8,
    isOn: (state) => !!state.diningRoom.lightPower,
  },
  // 3. Kitchen (Far East-South)
  {
    id: 'kitchen',
    name: 'Kitchen',
    roomKey: 'kitchen',
    position: [5.6, 2.4, 2.6],
    color: '#fff3db', // Clean warm task light
    maxIntensity: 35.0,
    distance: 6.8,
    decay: 1.8,
    isOn: (state) => !!state.kitchen.chimneyPower,
  },
  // 4. Master Bedroom (West-South)
  {
    id: 'bedroomMain',
    name: 'Master Bedroom',
    roomKey: 'bedroomMain',
    position: [-4.6, 2.4, 2.8],
    color: '#fed7aa', // Soft warm bedroom lighting
    maxIntensity: 38.0,
    distance: 7.5,
    decay: 1.8,
    isOn: (state) =>
      !!(
        state.bedroomMain.lightPower ||
        state.bedroomMain.lamp1Power ||
        state.bedroomMain.lamp2Power
      ),
  },
  // 5. Bedroom 2 (West-North)
  {
    id: 'bedroom2',
    name: 'Bedroom 2',
    roomKey: 'bedroom2',
    position: [-4.6, 2.4, -2.8],
    color: '#fed7aa', // Warm bedroom glow
    maxIntensity: 35.0,
    distance: 7.0,
    decay: 1.8,
    isOn: (state) => !!(state.bedroom2.lightPower || state.bedroom2.lampPower),
  },
  // 6. Main Bathroom / Bath 1 (Center-North-West)
  {
    id: 'bathroomMain',
    name: 'Main Bathroom',
    roomKey: 'bathroomMain',
    position: [-1.4, 2.3, -3.7],
    color: '#fef9c3', // Warm vanity illumination
    maxIntensity: 32.0,
    distance: 5.5,
    decay: 1.8,
    isOn: (state) => !!state.bathroomMain.lightPower,
  },
  // 7. Bathroom 2 / Guest Bath (Center-North-East)
  {
    id: 'bathroom2',
    name: 'Bathroom 2',
    roomKey: 'bathroom2',
    position: [0.6, 2.3, -3.7],
    color: '#fef9c3', // Warm vanity & shower illumination
    maxIntensity: 32.0,
    distance: 5.5,
    decay: 1.8,
    isOn: (state) => !!state.bathroom2.lightPower,
  },
  // 8. Bedroom 3 / Studio (East-North-Mid)
  {
    id: 'bedroom3',
    name: 'Bedroom 3 / Studio',
    roomKey: 'bedroom3',
    position: [2.8, 2.4, -2.8],
    color: '#fef3c7', // Warm studio glow
    maxIntensity: 34.0,
    distance: 6.5,
    decay: 1.8,
    isOn: (state) => !!(state.bedroom3.lightPower || state.bedroom3.lampPower),
  },
  // 9. Dedicated Garage Bay (Far East-North)
  {
    id: 'garage',
    name: 'Garage',
    roomKey: 'garage',
    position: [5.4, 2.4, -2.9],
    color: '#f8fafc', // High-clarity white garage illumination
    maxIntensity: 38.0,
    distance: 7.0,
    decay: 1.8,
    isOn: (state) => !!(state.garage.lightPower || state.garage.garageDoorOpen),
  },
  // 10. Front Porch Entrance
  {
    id: 'frontPorch',
    name: 'Front Porch',
    roomKey: 'livingRoom',
    position: [0.0, 2.0, 6.2],
    color: '#fde047', // Warm welcoming entrance lantern
    maxIntensity: 30.0,
    distance: 5.5,
    decay: 1.8,
    isOn: (state) => !!state.livingRoom.mainDoorOpen,
  },
];

function AnimatedRoomPointLight({
  config,
  isOn,
}: {
  config: RoomLightConfig;
  isOn: boolean;
}) {
  const lightRef = useRef<THREE.PointLight>(null);
  const currentIntensity = useRef(isOn ? config.maxIntensity : 0);

  // Smoothly damp light intensity between 0 (complete shadow/darkness) and maxIntensity
  useFrame((_, delta) => {
    if (lightRef.current) {
      const target = isOn ? config.maxIntensity : 0;
      currentIntensity.current = THREE.MathUtils.damp(
        currentIntensity.current,
        target,
        6,
        delta
      );
      lightRef.current.intensity = currentIntensity.current;
    }
  });

  return (
    <group position={config.position}>
      {/* Invisible point light emitting warm illumination and casting shadows onto floor and walls */}
      <pointLight
        ref={lightRef}
        color={config.color}
        distance={config.distance}
        decay={config.decay}
        castShadow
        shadow-bias={-0.0012}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
    </group>
  );
}

interface RoomLightSourcesProps {
  roomsState: AllRoomsState;
}

export function RoomLightSources({ roomsState }: RoomLightSourcesProps) {
  return (
    <group>
      {ROOM_LIGHT_CONFIGS.map((config) => {
        const isOn = config.isOn(roomsState);
        return (
          <AnimatedRoomPointLight
            key={config.id}
            config={config}
            isOn={isOn}
          />
        );
      })}
    </group>
  );
}
