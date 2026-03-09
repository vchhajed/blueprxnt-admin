import { NextResponse } from 'next/server';

// Packages are managed statically in the dashboard UI.
// This endpoint is reserved for future database integration.
export async function GET() {
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}
