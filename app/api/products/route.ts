import { NextRequest, NextResponse } from 'next/server';
import { listProducts } from '@/lib/products';

export const GET = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
  const q = (searchParams.get('q') || '').trim();

  try {
    const data = await listProducts(page, limit, q || undefined);
    return NextResponse.json(data);
  } catch (error) {
    console.error('GET /api/products error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
};
