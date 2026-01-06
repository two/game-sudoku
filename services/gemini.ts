
import { GoogleGenAI, Type } from "@google/genai";
import { Grid, HintResponse } from "../types";

export const getSmartHint = async (grid: Grid, solution: number[][]): Promise<HintResponse | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const size = grid.length;
    
    // Find an empty cell or an incorrect cell
    let targetRow = -1;
    let targetCol = -1;
    let found = false;

    // Preference: Find a cell with a missing value first
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c].value === null) {
          targetRow = r;
          targetCol = c;
          found = true;
          break;
        }
      }
      if (found) break;
    }

    if (!found) return null;

    const boardString = grid.map(row => row.map(cell => cell.value || 0).join(',')).join('\n');
    const correctValue = solution[targetRow][targetCol];

    const prompt = `
      Current Sudoku Board (${size}x${size}, 0 means empty):
      ${boardString}

      I need a hint for the cell at Row ${targetRow + 1}, Column ${targetCol + 1} (0-indexed: row ${targetRow}, col ${targetCol}).
      The correct value is ${correctValue}.
      Explain logically WHY ${correctValue} must go there based on the current board state (rules: row, column, and subgrid).
      Keep the explanation concise and encouraging.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: {
              type: Type.STRING,
              description: "A logical explanation for the hint."
            },
            row: { type: Type.INTEGER },
            col: { type: Type.INTEGER },
            value: { type: Type.INTEGER }
          },
          required: ["explanation", "row", "col", "value"]
        }
      }
    });

    const result = JSON.parse(response.text.trim());
    return {
      ...result,
      row: targetRow,
      col: targetCol,
      value: correctValue
    };
  } catch (error) {
    console.error("Gemini Hint Error:", error);
    return null;
  }
};
