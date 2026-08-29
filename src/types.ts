export type ViewMode = 'dashboard' | 'loading' | 'layout';

export type RoomId =
  | 'living-room'
  | 'bedroom-main'
  | 'bedroom-2'
  | 'bedroom-3'
  | 'dining-room'
  | 'kitchen'
  | 'bathroom-main'
  | 'bathroom-2'
  | 'garage';

export interface LivingRoomState {
  mainDoorOpen: boolean;
  fanPower: boolean;
  fanSpeed: number; // 0-100
  fanMode: 'off' | 'low' | 'med' | 'high';
  acPower: boolean;
  acTemp: number; // 60-85°F
}

export interface BedroomMainState {
  lightPower: boolean;
  lamp1Power: boolean;
  lamp1Intensity: number; // 0-100
  lamp2Power: boolean;
  lamp2Intensity: number; // 0-100
  acPower: boolean;
  acTemp: number;
}

export interface Bedroom2State {
  lightPower: boolean;
  lampPower: boolean;
  lampIntensity: number; // 0-100
  acPower: boolean;
  acTemp: number;
  fanPower: boolean;
  fanSpeed: number;
  fanMode: 'off' | 'low' | 'med' | 'high';
}

export interface Bedroom3State {
  lightPower: boolean;
  lampPower: boolean;
  lampIntensity: number; // 0-100
  acPower: boolean;
  acTemp: number;
}

export interface DiningRoomState {
  lightPower: boolean;
  acPower: boolean;
  acTemp: number;
}

export interface KitchenState {
  chimneyPower: boolean;
  chimneySpeed: 'low' | 'med' | 'high' | 'turbo';
  windowOpen: boolean;
}

export interface BathroomState {
  lightPower: boolean;
  exhaustFanPower: boolean;
}

export interface GarageState {
  garageDoorOpen: boolean;
  lightPower: boolean;
}

export interface AllRoomsState {
  livingRoom: LivingRoomState;
  bedroomMain: BedroomMainState;
  bedroom2: Bedroom2State;
  bedroom3: Bedroom3State;
  diningRoom: DiningRoomState;
  kitchen: KitchenState;
  bathroomMain: BathroomState;
  bathroom2: BathroomState;
  garage: GarageState;
}

export type TemperatureUnit = 'F' | 'C';

export type OrbState = 'idle' | 'listening' | 'thinking';

export type WeatherCondition = 'sunny' | 'rainy' | 'winter' | 'night';

export interface TranscriptMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  timestamp: string;
  type?: 'command' | 'preference' | 'chat' | 'weather_trigger';
  deviceUpdates?: Record<string, any>;
}

export interface PreferenceRule {
  id: string;
  ruleText: string;
  condition: string; // e.g. 'rainy', 'winter', 'sunny', 'night'
  conditionDescription: string;
  summary: string;
  deviceUpdates: Record<string, any>;
  createdAt: string;
  lastTriggered?: string;
}

