import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

// serves the pinned spec the API reference renders, so agents and readers get the same version as the docs
export async function GET() {
  const spec = fs.readFileSync(path.join(process.cwd(), 'src/content/openapi/openapi.yaml'), 'utf-8');
  return new Response(spec, {
    headers: { 'Content-Type': 'application/yaml; charset=utf-8' },
  });
}
