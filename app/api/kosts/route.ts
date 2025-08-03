import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'db', 'kosan.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const kosts = JSON.parse(fileContents);
    
    return NextResponse.json(kosts);
  } catch (error) {
    console.error('Error reading kosts:', error);
    return NextResponse.json({ error: 'Failed to load kosts' }, { status: 500 });
  }
}