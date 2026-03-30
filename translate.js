import ollama from 'ollama';
import fs from 'fs/promises';
import { existsSync, statSync } from 'fs';
import path from 'path';
import { glob } from 'glob';

// --- CONFIGURATION ---
const MODEL_NAME = 'gemma2'; 

async function translateFile(filePathFr) {
  // On ne change QUE le /fr/ en /en/. On garde 'formation' tel quel.
  let filePathEn = filePathFr.replace('/fr/', '/en/');

  if (existsSync(filePathEn)) {
    const statsFr = statSync(filePathFr);
    const statsEn = statSync(filePathEn);
    if (statsEn.mtime > statsFr.mtime) {
      console.log(`⏩ Skipping (Up to date): ${filePathFr}`);
      return;
    }
  }

  try {
    const contentFr = await fs.readFile(filePathFr, 'utf-8');
    console.log(`🚀 Translating with Gemma 2: ${filePathFr} -> ${filePathEn}`);

    const response = await ollama.generate({
      model: MODEL_NAME,
      prompt: `You are a professional translator. Translate this Markdown/MDX file from French to English.
      
      STRICT RULES:
      1. Keep all frontmatter keys (title, description, slug, etc.) exactly as they are. Translate ONLY their values.
      2. Keep all Markdown/MDX syntax, code blocks, and HTML tags intact.
      3. Do not translate technical terms in code or image paths.
      4. Your output MUST start with the frontmatter (---). Do not add any introduction or comments.

      CONTENT:
      ${contentFr}`,
      stream: false
    });

    let translation = response.response;

    // Nettoyage de sécurité
    const startIdx = translation.indexOf('---');
    if (startIdx !== -1) {
      translation = translation.substring(startIdx);
    }

    await fs.mkdir(path.dirname(filePathEn), { recursive: true });
    await fs.writeFile(filePathEn, translation.trim());
    console.log(`✅ Success: ${filePathEn}`);

  } catch (error) {
    console.error(`❌ Error on ${filePathFr}:`, error.message);
  }
}

async function translateAll() {
  console.log("📡 Starting local translation engine (Gemma 2)...");
  const files = await glob('src/content/docs/fr/**/*.{md,mdx}');
  
  if (files.length === 0) {
    console.log("❓ No files found in src/content/docs/fr/.");
    return;
  }

  for (const file of files) {
    await translateFile(file);
  }
  console.log("🏁 All translations done!");
}

translateAll();