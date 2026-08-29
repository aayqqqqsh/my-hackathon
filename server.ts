/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Fallback rule/command parser when Gemini API key is not yet configured
function fallbackNLP(transcript: string, currentState: any) {
  const text = transcript.toLowerCase().trim();

  // Check if it's a preference / rule (contains "when", "if", "whenever", "rule", "preference")
  if (
    text.includes('when') ||
    text.includes('if it') ||
    text.includes('whenever') ||
    text.includes('always close') ||
    text.includes('always turn')
  ) {
    let condition = 'rainy';
    let conditionDesc = 'Rainy weather';
    const updates: Record<string, any> = {};

    if (text.includes('rain') || text.includes('storm')) {
      condition = 'rainy';
      conditionDesc = 'When it rains';
      updates.livingRoom = { mainDoorOpen: false };
      updates.kitchen = { windowOpen: false };
      updates.garage = { garageDoorOpen: false };
    } else if (text.includes('winter') || text.includes('cold') || text.includes('snow')) {
      condition = 'winter';
      conditionDesc = 'Winter / Cold weather';
      updates.livingRoom = { acPower: false, fanPower: false };
      updates.bedroomMain = { acPower: false };
      updates.bedroom2 = { acPower: false, fanPower: false };
      updates.bedroom3 = { acPower: false };
      updates.diningRoom = { acPower: false };
    } else if (text.includes('sun') || text.includes('hot') || text.includes('summer')) {
      condition = 'sunny';
      conditionDesc = 'Sunny / Hot weather';
      updates.livingRoom = { acPower: true, acTemp: 70, fanPower: true };
      updates.bedroomMain = { acPower: true, acTemp: 68 };
      updates.bedroom2 = { acPower: true, acTemp: 70 };
    } else {
      condition = 'custom';
      conditionDesc = `Condition: ${transcript}`;
      updates.livingRoom = { mainDoorOpen: false };
    }

    return {
      type: 'preference',
      preference: {
        id: `pref-${Date.now()}`,
        ruleText: transcript,
        condition,
        conditionDescription: conditionDesc,
        deviceUpdates: updates,
        summary: `Automate: ${conditionDesc} -> Update matching home devices`,
      },
      message: `Got it! I've saved a rule to execute whenever it's ${condition}: "${transcript}". You can see and trigger it in the Preferences panel.`,
    };
  }

  // Check direct device commands
  const updates: Record<string, any> = {};
  let handled = false;
  let responseText = '';

  if (text.includes('door') || text.includes('doors')) {
    if (text.includes('garage')) {
      const open = text.includes('open');
      updates.garage = { garageDoorOpen: open };
      responseText = `I've ${open ? 'opened' : 'closed'} the garage door.`;
      handled = true;
    } else {
      const open = text.includes('open');
      updates.livingRoom = { mainDoorOpen: open };
      if (text.includes('garage') || text.includes('all')) {
        updates.garage = { garageDoorOpen: open };
      }
      responseText = `I've ${open ? 'opened' : 'closed'} the front main door.`;
      handled = true;
    }
  }

  if (text.includes('window') || text.includes('windows')) {
    const open = text.includes('open');
    updates.kitchen = { windowOpen: open };
    responseText = `I've ${open ? 'opened' : 'closed'} the kitchen window.`;
    handled = true;
  }

  if (text.includes('light') || text.includes('lights') || text.includes('lamp')) {
    const turnOn = !text.includes('off') && (text.includes('on') || text.includes('turn on') || text.includes('set'));
    if (text.includes('all') || text.includes('every')) {
      updates.bedroomMain = { lightPower: turnOn, lamp1Power: turnOn, lamp2Power: turnOn };
      updates.bedroom2 = { lightPower: turnOn, lampPower: turnOn };
      updates.bedroom3 = { lightPower: turnOn, lampPower: turnOn };
      updates.diningRoom = { lightPower: turnOn };
      updates.bathroomMain = { lightPower: turnOn };
      updates.bathroom2 = { lightPower: turnOn };
      responseText = `I've turned ${turnOn ? 'on' : 'off'} all interior lights across all rooms.`;
      handled = true;
    } else if (text.includes('dining')) {
      updates.diningRoom = { lightPower: turnOn };
      responseText = `I've turned ${turnOn ? 'on' : 'off'} the dining room chandelier light.`;
      handled = true;
    } else if (text.includes('main bedroom') || text.includes('master bedroom')) {
      updates.bedroomMain = { lightPower: turnOn, lamp1Power: turnOn, lamp2Power: turnOn };
      responseText = `I've turned ${turnOn ? 'on' : 'off'} the master bedroom lights.`;
      handled = true;
    } else if (text.includes('bedroom 2') || text.includes('bedroom two')) {
      updates.bedroom2 = { lightPower: turnOn, lampPower: turnOn };
      responseText = `I've turned ${turnOn ? 'on' : 'off'} the bedroom 2 lights.`;
      handled = true;
    } else if (text.includes('bedroom 3') || text.includes('bedroom three')) {
      updates.bedroom3 = { lightPower: turnOn, lampPower: turnOn };
      responseText = `I've turned ${turnOn ? 'on' : 'off'} the bedroom 3 lights.`;
      handled = true;
    } else if (text.includes('bathroom')) {
      updates.bathroomMain = { lightPower: turnOn };
      updates.bathroom2 = { lightPower: turnOn };
      responseText = `I've turned ${turnOn ? 'on' : 'off'} the bathroom lights.`;
      handled = true;
    } else {
      // Default to main bedroom / dining
      updates.bedroomMain = { lightPower: turnOn };
      updates.diningRoom = { lightPower: turnOn };
      responseText = `I've turned ${turnOn ? 'on' : 'off'} the primary living & bedroom lights.`;
      handled = true;
    }
  }

  if (text.includes('fan') || text.includes('fans')) {
    const turnOn = !text.includes('off') && (text.includes('on') || text.includes('turn on'));
    if (text.includes('exhaust') || text.includes('bathroom')) {
      updates.bathroomMain = { exhaustFanPower: turnOn };
      updates.bathroom2 = { exhaustFanPower: turnOn };
      responseText = `I've switched ${turnOn ? 'on' : 'off'} the bathroom exhaust fans.`;
      handled = true;
    } else if (text.includes('bedroom 2') || text.includes('bedroom two')) {
      updates.bedroom2 = { fanPower: turnOn };
      responseText = `I've turned ${turnOn ? 'on' : 'off'} the fan in Bedroom 2.`;
      handled = true;
    } else {
      updates.livingRoom = { fanPower: turnOn };
      responseText = `I've turned ${turnOn ? 'on' : 'off'} the living room ceiling fan.`;
      handled = true;
    }
  }

  if (text.includes('ac') || text.includes('air conditioning') || text.includes('temp') || text.includes('temperature')) {
    const turnOn = !text.includes('off') && (text.includes('on') || text.includes('set') || text.includes('turn on'));
    const tempMatch = text.match(/(\d{2})/);
    const targetTemp = tempMatch ? Math.min(85, Math.max(60, parseInt(tempMatch[1], 10))) : 70;

    if (text.includes('living')) {
      updates.livingRoom = { acPower: turnOn, ...(tempMatch ? { acTemp: targetTemp } : {}) };
      responseText = tempMatch
        ? `I've set the Living Room AC to ${targetTemp}°F.`
        : `I've turned ${turnOn ? 'on' : 'off'} the Living Room AC.`;
      handled = true;
    } else if (text.includes('bedroom') || text.includes('master')) {
      updates.bedroomMain = { acPower: turnOn, ...(tempMatch ? { acTemp: targetTemp } : {}) };
      responseText = tempMatch
        ? `I've set the Master Bedroom AC to ${targetTemp}°F.`
        : `I've turned ${turnOn ? 'on' : 'off'} the Master Bedroom AC.`;
      handled = true;
    } else {
      updates.livingRoom = { acPower: turnOn, ...(tempMatch ? { acTemp: targetTemp } : {}) };
      updates.bedroomMain = { acPower: turnOn, ...(tempMatch ? { acTemp: targetTemp } : {}) };
      responseText = tempMatch
        ? `I've set the home climate to ${targetTemp}°F.`
        : `I've switched ${turnOn ? 'on' : 'off'} the primary climate control.`;
      handled = true;
    }
  }

  if (text.includes('chimney') || text.includes('kitchen vent')) {
    const turnOn = !text.includes('off') && (text.includes('on') || text.includes('turn on'));
    updates.kitchen = { chimneyPower: turnOn };
    responseText = `I've turned ${turnOn ? 'on' : 'off'} the kitchen exhaust chimney.`;
    handled = true;
  }

  if (handled && Object.keys(updates).length > 0) {
    return {
      type: 'command',
      deviceUpdates: updates,
      message: responseText,
    };
  }

  // General conversational response
  return {
    type: 'chat',
    message: `I'm listening. You can command any device (e.g. "turn on bedroom lights", "open garage door", "set AC to 70") or state automation rules like "close doors and windows when it rains".`,
  };
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Health check
  app.get('/api/health', (_req, res) => {
    const hasKey = Boolean(
      process.env.GEMINI_API_KEY &&
        process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' &&
        process.env.GEMINI_API_KEY.trim() !== ''
    );
    res.json({
      status: 'ok',
      hasApiKey: hasKey,
    });
  });

  // Home AI natural language processing endpoint
  app.post('/api/home-ai/process', async (req, res) => {
    try {
      const { transcript, currentState, preferences, currentWeather } = req.body;

      if (!transcript || typeof transcript !== 'string') {
        res.status(400).json({ error: 'Transcript is required' });
        return;
      }

      const client = getGenAIClient();

      if (!client) {
        // Use intelligent local parser if API key is not provided
        const parsed = fallbackNLP(transcript, currentState);
        res.json({
          ...parsed,
          notice: 'Key note: Gemini API key not detected. Handled via local intelligent processor.',
          apiKeyPresent: false,
        });
        return;
      }

      const systemInstruction = `You are KeepSafe Home AI, an intelligent home automation system.
The home has the following rooms and controllable states:
- livingRoom: mainDoorOpen (boolean), fanPower (boolean), fanSpeed (number 0-100), fanMode ('off'|'low'|'med'|'high'), acPower (boolean), acTemp (number 60-85)
- bedroomMain: lightPower (boolean), lamp1Power (boolean), lamp1Intensity (number 0-100), lamp2Power (boolean), lamp2Intensity (number 0-100), acPower (boolean), acTemp (number 60-85)
- bedroom2: lightPower (boolean), lampPower (boolean), lampIntensity (number 0-100), acPower (boolean), acTemp (number 60-85), fanPower (boolean), fanSpeed (number 0-100), fanMode ('off'|'low'|'med'|'high')
- bedroom3: lightPower (boolean), lampPower (boolean), lampIntensity (number 0-100), acPower (boolean), acTemp (number 60-85)
- diningRoom: lightPower (boolean), acPower (boolean), acTemp (number 60-85)
- kitchen: chimneyPower (boolean), chimneySpeed ('low'|'med'|'high'|'turbo'), windowOpen (boolean)
- bathroomMain: lightPower (boolean), exhaustFanPower (boolean)
- bathroom2: lightPower (boolean), exhaustFanPower (boolean)
- garage: garageDoorOpen (boolean)

Current Weather is: ${currentWeather || 'sunny'}
Current Home State: ${JSON.stringify(currentState || {})}

Analyze the user's spoken transcript carefully. You must categorize it into ONE of three action types:

1. "command": Direct instruction to change one or more devices right now (e.g. "turn on master bedroom lights", "open the garage", "set living room temperature to 68", "turn off all lights", "close the kitchen window").
   Return 'deviceUpdates' object containing only the room keys and properties that should be changed.
   Provide a concise, polite 'message' describing what was done.

2. "preference": A conditional automation rule or preference the user wants remembered for the future (e.g. "I want doors and windows closed when it rains", "turn off the AC when it is winter", "turn on bedroom lamps whenever it gets dark", "close garage when I am away").
   DO NOT execute immediate state changes.
   Return 'preference' object with:
     - condition: one of "rainy", "sunny", "winter", "night", "away", or another short keyword
     - conditionDescription: readable trigger like "When it rains" or "During winter weather"
     - deviceUpdates: the object of room state changes to execute when that condition triggers (e.g. { "livingRoom": { "mainDoorOpen": false }, "kitchen": { "windowOpen": false } })
     - summary: clear plain text summary of the rule (e.g. "Close all doors and windows when raining")
   Provide a warm 'message' confirming the rule was recorded.

3. "chat": General question, conversational comment, or greeting not specifying a device change or automation rule (e.g. "What can you do?", "Hello", "How is the weather?").
   Provide a helpful, friendly 'message'.`;

      const response = await client.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: transcript,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              type: {
                type: Type.STRING,
                description: 'Must be "command", "preference", or "chat"',
              },
              message: {
                type: Type.STRING,
                description: 'The natural spoken response to display to the user.',
              },
              deviceUpdates: {
                type: Type.OBJECT,
                description: 'Key-value map of room keys to updated properties for "command" type.',
                nullable: true,
              },
              preference: {
                type: Type.OBJECT,
                description: 'Preference object for "preference" type.',
                nullable: true,
                properties: {
                  condition: { type: Type.STRING },
                  conditionDescription: { type: Type.STRING },
                  deviceUpdates: { type: Type.OBJECT },
                  summary: { type: Type.STRING },
                },
              },
            },
            required: ['type', 'message'],
          },
        },
      });

      const responseText = response.text || '{}';
      const parsed = JSON.parse(responseText);

      if (parsed.type === 'preference' && parsed.preference) {
        parsed.preference.id = `pref-${Date.now()}`;
        parsed.preference.ruleText = transcript;
      }

      res.json({
        ...parsed,
        apiKeyPresent: true,
      });
    } catch (err: any) {
      console.error('Gemini API execution error:', err);
      // Graceful fallback to local parser if Gemini throws an error
      const fallback = fallbackNLP(req.body.transcript || '', req.body.currentState || {});
      res.json({
        ...fallback,
        notice: `API fallback activated: ${err.message || 'Error communicating with model'}`,
        apiKeyPresent: true,
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KeepSafe Server running on port ${PORT}`);
  });
}

startServer();
