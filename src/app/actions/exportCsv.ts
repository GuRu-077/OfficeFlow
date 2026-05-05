'use server'

import fs from 'fs';
import path from 'path';

export async function saveCsvLocally(csvContent: string, filename: string) {
  try {
    // Save to an 'exports' folder in the root of the project
    const exportsDir = path.join(process.cwd(), 'exports');
    
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }
    
    const filePath = path.join(exportsDir, filename);
    fs.writeFileSync(filePath, csvContent, 'utf8');
    
    return { success: true, filePath };
  } catch (error: any) {
    console.error("Error saving CSV locally:", error);
    return { success: false, error: error.message || 'Failed to save file' };
  }
}
