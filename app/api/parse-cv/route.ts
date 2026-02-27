import { NextRequest, NextResponse } from 'next/server';
import { parseCVText } from '@/lib/cvParsing';

// This route handles CV parsing
// It receives a file URL, extracts text, and returns structured data

export async function POST(request: NextRequest) {
  try {
    const { fileUrl, fileType } = await request.json();

    if (!fileUrl) {
      return NextResponse.json(
        { error: 'File URL is required' },
        { status: 400 }
      );
    }

    // Fetch the file
    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) {
      throw new Error('Failed to fetch file');
    }

    const fileBuffer = await fileResponse.arrayBuffer();
    let cvText = '';

    // Extract text based on file type
    if (fileType === 'application/pdf') {
      // For PDF, we'll use a simple text extraction
      // In production, you might want to use a library like pdf-parse
      const textDecoder = new TextDecoder('utf-8');
      cvText = textDecoder.decode(fileBuffer);
      
      // Clean up PDF artifacts
      // eslint-disable-next-line no-control-regex
      cvText = cvText
        .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, '') // Remove control characters
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
    } else if (
      fileType === 'application/msword' ||
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      // For DOC/DOCX, basic text extraction
      const textDecoder = new TextDecoder('utf-8');
      cvText = textDecoder.decode(fileBuffer);
      
      // Clean up
      // eslint-disable-next-line no-control-regex
      cvText = cvText
        .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type' },
        { status: 400 }
      );
    }

    if (!cvText || cvText.length < 100) {
      return NextResponse.json(
        { error: 'Could not extract sufficient text from the file. The file might be an image-based PDF or corrupted.' },
        { status: 400 }
      );
    }

    // Parse the CV text using Gemini
    const { response: parsedData, modelUsed } = await parseCVText(cvText);

    return NextResponse.json({
      success: true,
      data: parsedData,
      modelUsed,
      textLength: cvText.length,
    });

  } catch (error: any) {
    console.error('CV parsing error:', error);
    
    let errorMessage = 'Failed to parse CV';
    if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
