/**
 * Generate QR code images for all 200 GOLD cards.
 *
 * Usage:
 *   1. Copy .env.local.example to .env.local and fill in values
 *   2. npm install
 *   3. npm run generate-qr
 *
 * Output: ./qr-codes/ folder with 200 PNG files + an HTML print sheet
 */

import { createClient } from '@supabase/supabase-js';
import QRCode from 'qrcode';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { config } from 'dotenv';

// Load env
config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://your-app.vercel.app';

async function main() {
  console.log('Fetching cards from Supabase...');

  const { data: cards, error } = await supabase
    .from('gold_cards')
    .select('card_code, qr_token')
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching cards:', error);
    process.exit(1);
  }

  console.log(`Found ${cards.length} cards. Generating QR codes...`);

  const outDir = './qr-codes';
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  let htmlRows = '';

  for (const card of cards) {
    const url = `${BASE_URL}/r/${card.qr_token}`;
    const fileName = `${card.card_code}.png`;

    // Generate PNG
    await QRCode.toFile(`${outDir}/${fileName}`, url, {
      width: 300,
      margin: 2,
      color: { dark: '#1c1917', light: '#ffffff' },
    });

    // Generate data URL for HTML sheet
    const dataUrl = await QRCode.toDataURL(url, {
      width: 200,
      margin: 1,
      color: { dark: '#1c1917', light: '#ffffff' },
    });

    htmlRows += `
      <div class="card">
        <img src="${dataUrl}" alt="${card.card_code}" />
        <p class="code">${card.card_code}</p>
        <p class="token">${card.qr_token.substring(0, 8)}...</p>
      </div>
    `;
  }

  // Generate print-ready HTML
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>GOLD Cards — QR Codes for Printing</title>
  <style>
    @page { margin: 10mm; }
    body { font-family: system-ui, sans-serif; margin: 0; padding: 10mm; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8mm; }
    .card {
      border: 1px solid #e5e5e5;
      border-radius: 4mm;
      padding: 4mm;
      text-align: center;
      page-break-inside: avoid;
    }
    .card img { width: 35mm; height: 35mm; }
    .code { font-weight: 700; font-size: 14px; margin: 2mm 0 0; }
    .token { font-size: 8px; color: #999; margin: 1mm 0 0; }
    @media print {
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom:10mm; padding:4mm; background:#f5f5f5; border-radius:4mm;">
    <strong>Instrucțiuni:</strong> Printează această pagină. Decupează fiecare QR și lipește-l pe spatele cardului PVC corespunzător.
    <br><button onclick="window.print()" style="margin-top:4mm; padding:8px 16px; cursor:pointer;">🖨 Print</button>
  </div>
  <div class="grid">${htmlRows}</div>
</body>
</html>`;

  writeFileSync(`${outDir}/print-sheet.html`, html);

  console.log(`\n✓ Generated ${cards.length} QR codes in ${outDir}/`);
  console.log(`✓ Print sheet: ${outDir}/print-sheet.html`);
  console.log(`\nEach QR links to: ${BASE_URL}/r/{token}`);
}

main().catch(console.error);
