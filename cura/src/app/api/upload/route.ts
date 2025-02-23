import { NextRequest, NextResponse } from 'next/server';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '@/lib/firebase';
import { prisma } from '@/lib/prisma';
import { extractTextFromFile, sanitizeText, truncateText } from '@/lib/file-processing';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'File is required' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    const fileExtension = file.name.split('.').pop();
    const randomFileName = `${uuidv4()}.${fileExtension}`;
    const dynamicFilePath = `uploads/${randomFileName}`;

    const storage = getStorage(app);
    const storageRef = ref(storage, dynamicFilePath);
    await uploadBytes(storageRef, fileBuffer);
    const fileUrl = await getDownloadURL(storageRef);

    const text = await extractTextFromFile(new File([fileBuffer], randomFileName, { type: file.type }));
    const sanitizedText = sanitizeText(text);
    const truncatedText = truncateText(sanitizedText);

    const article = await prisma.article.create({
      data: {
        title: file.name,
        content: truncatedText,
        fileUrl,
        wordCount: truncatedText.split(/\s+/).length,
      },
    });

    return NextResponse.json({ success: true, articleId: article.id, text: truncatedText });
  } catch (error) {
    console.error('Error processing content:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to process content', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
