// Corrige la syntaxe Tailwind v4 "w-(--variable)" générée par shadcn-vue
// vers la syntaxe Tailwind v3 compatible "w-[var(--variable)]".
// Usage : node fix-tailwind-v3.js
// A relancer après chaque `npx shadcn-vue@latest add <composant>`.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const TARGET_DIR = path.join(__dirname, 'app', 'components', 'ui')
const PATTERN = /-\(--([a-zA-Z0-9-]+)\)/g
const REPLACEMENT = '-[var(--$1)]'

let filesFixed = 0

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(fullPath)
    } else if (entry.name.endsWith('.vue') || entry.name.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8')
      const fixed = content.replace(PATTERN, REPLACEMENT)
      if (fixed !== content) {
        fs.writeFileSync(fullPath, fixed, 'utf8')
        filesFixed++
        console.log('Corrigé :', path.relative(__dirname, fullPath))
      }
    }
  }
}

if (!fs.existsSync(TARGET_DIR)) {
  console.error('Dossier introuvable :', TARGET_DIR)
  process.exit(1)
}

walk(TARGET_DIR)
console.log(`\n${filesFixed} fichier(s) corrigé(s).`)