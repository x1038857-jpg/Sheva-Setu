import { NextRequest, NextResponse } from 'next/server';
import { verifyDocumentAuthenticity, extractDocumentData } from '@/lib/ai/documents';

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, documentType } = await request.json();

    if (!imageBase64 || !documentType) {
      return NextResponse.json({ error: 'imageBase64 and documentType are required.' }, { status: 400 });
    }

    const verification = await verifyDocumentAuthenticity(imageBase64, documentType);
    const extractedData = await extractDocumentData(imageBase64, documentType);

    return NextResponse.json({ verification, extractedData });
  } catch (error) {
    console.error('Authenticity check failed:', error);
    return NextResponse.json({ error: 'Authenticity check failed.' }, { status: 500 });
  }
}
