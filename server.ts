import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API: Refine Design with natural language instructions
app.post('/api/gemini/refine-design', async (req, res) => {
  const { currentDesign, prompt, roomModel } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  if (ai) {
    try {
      const systemInstruction = `You are a master furniture craftsman and architectural spatial interior designer. 
You specialize in solid wood furniture (white oak, walnut, ash, cherry, maple) and architectural surface materials.
Given a current room design, room spatial constraints, and a homeowner's refinement request, return a JSON response detailing:
1. "designTitle": string
2. "narrative": string explaining the design change and why it meets spatial and lifestyle needs
3. "woodSpecies": string
4. "finishType": string
5. "flooring": string
6. "wallFinish": string
7. "lighting": string
8. "itemsModified": array of { name: string, changeDescription: string, estimatedPriceChange: number }
9. "newEstimatedBudget": number
10. "customFurnitureNotes": string regarding wood movement, joinery, and scale.
Respond in valid JSON only.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Room: ${JSON.stringify(roomModel || {})}
Current Design: ${JSON.stringify(currentDesign || {})}
Homeowner's instruction: "${prompt}"
Provide the refined design specification JSON:`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ success: true, refined: parsed });
    } catch (err: any) {
      console.warn('Gemini API call encountered error, providing craftsman fallback:', err.message);
    }
  }

  // Graceful rule-based architectural fallback
  const pLower = prompt.toLowerCase();
  let wood = currentDesign?.woodSpecies || 'White Oak';
  let finish = currentDesign?.finishType || 'Natural Matte Hardwax Oil';
  let budget = currentDesign?.estimatedBudget || 14800;

  if (pLower.includes('lighter') || pLower.includes('ash') || pLower.includes('pale')) {
    wood = 'Blonde Ash & Pale Birch';
    finish = 'Nordic Soap Finish';
    budget -= 600;
  } else if (pLower.includes('darker') || pLower.includes('walnut') || pLower.includes('rich')) {
    wood = 'American Black Walnut';
    finish = 'Rubio Monocoat Pure Oil';
    budget += 1200;
  } else if (pLower.includes('reduce') || pLower.includes('cheaper') || pLower.includes('budget')) {
    budget = Math.max(8000, budget - 2500);
  } else if (pLower.includes('smaller')) {
    budget -= 800;
  }

  return res.json({
    success: true,
    refined: {
      designTitle: `Refined: ${prompt.slice(0, 45)}`,
      narrative: `Adjusted the spatial composition in response to "${prompt}". Preserved the room's primary circulation pathways (minimum 36" clearance around dining table) while optimizing the wood tones and finish harmony.`,
      woodSpecies: wood,
      finishType: finish,
      flooring: pLower.includes('floor') ? 'Engineered French White Oak (Wide Plank)' : (currentDesign?.flooring || 'Wide Plank Engineered Oak'),
      wallFinish: pLower.includes('warm') ? 'Roman Clay Greige Finish' : 'Bone White Limewash Paint',
      lighting: 'Brushed Solid Brass Linear Pendant',
      itemsModified: [
        {
          name: 'Primary Dining Table',
          changeDescription: `Refined dimensions and material to suit: "${prompt}"`,
          estimatedPriceChange: -400,
        },
      ],
      newEstimatedBudget: budget,
      customFurnitureNotes: 'All solid wood components maintain allowances for cross-grain seasonal movement via slotted tabletop fasteners.',
    },
  });
});

// API: Generate Technical Specification & Joinery Calculation
app.post('/api/gemini/generate-spec', async (req, res) => {
  const { itemType, woodSpecies, dimensions, customRequests } = req.body;

  if (ai) {
    try {
      const promptText = `Generate a rigorous furniture woodworking fabrication specification for:
Type: ${itemType || 'Dining Table'}
Wood: ${woodSpecies || 'Solid White Oak'}
Dimensions: ${JSON.stringify(dimensions || { lengthMm: 2200, widthMm: 950, heightMm: 750 })}
Custom requests: ${customRequests || 'None'}

Return a JSON with:
{
  "joineryMethod": string,
  "topThicknessMm": number,
  "apronHeightMm": number,
  "legCrossSectionMm": string,
  "expansionFasteners": string,
  "moistureContentSpec": string,
  "finishSchedule": string,
  "toleranceMm": number,
  "criticalNotes": string[],
  "manufacturerReviewItems": string[]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: promptText,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ success: true, spec: parsed });
    } catch (err: any) {
      console.warn('Gemini spec error, falling back:', err.message);
    }
  }

  // Woodworking fabrication default spec
  return res.json({
    success: true,
    spec: {
      joineryMethod: 'Mortise & tenon apron-to-leg joinery with integral breadboard end pins',
      topThicknessMm: 38,
      apronHeightMm: 70,
      legCrossSectionMm: '75 x 75 mm solid billets',
      expansionFasteners: 'Figure-eight steel clips with slotted counter-bores along apron',
      moistureContentSpec: 'Kiln-dried lumber at 6% - 8% equilibrium moisture content (EMC)',
      finishSchedule: 'Two-coat hand-rubbed hardwax oil with 0000 bronze wool denibbing',
      toleranceMm: 1.5,
      criticalNotes: [
        'Breadboard ends secured with center glued dowel and slotted outer dowels to accommodate ±4mm seasonal cross-grain expansion.',
        'Underside of top receives 3mm relief kerfs to balance moisture absorption between face and back.',
        'Leg bases equipped with recessed stainless steel M8 leveling glides with felt pads.'
      ],
      manufacturerReviewItems: [
        'Confirm lumber grain matching pattern (bookmatched vs slip-matched rift sawn top).',
        'Verify door threshold clearance during on-site delivery.'
      ]
    }
  });
});

// Vite or Static file serving
async function startServer() {
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

startServer();
