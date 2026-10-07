import { NextRequest, NextResponse } from 'next/server';
import { supabase, getCurrentUser } from '@/lib/supabase';
import { verifyDocumentAuthenticity, extractDocumentData } from '@/lib/ai/documents';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const applicationId = (formData.get('applicationId') as string | null) || 'demo-app';
    const documentType = (formData.get('documentType') as string | null) || 'Aadhaar';

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || 'image/jpeg';
    const base64 = `data:${mimeType};base64,${buffer.toString('base64')}`;

    const verification = await verifyDocumentAuthenticity(base64, documentType);
    const extractedData = await extractDocumentData(base64, documentType);

    const fileName = `${applicationId}/${Date.now()}-${file.name}`;

    try {
      const { error: storageError } = await supabase.storage.from('documents').upload(fileName, buffer, {
        contentType: mimeType,
        upsert: true,
      });

      if (storageError) {
        console.warn('Document storage skipped:', storageError.message);
      }
    } catch (storageError) {
      console.warn('Storage upload not configured yet:', storageError);
    }

    return NextResponse.json({
      message: 'Document processed successfully.',
      verification,
      extractedData,
      document: {
        id: 'demo-document-id',
        file_name: file.name,
        file_path: fileName,
      },
    });
  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json({ error: 'Document upload failed.' }, { status: 500 });
  }
}
