
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { TextLoader } from "langchain/document_loaders/fs/text";

export async function extractTextFromFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const fileType = file.type;
  let text = '';

  try {
    switch (fileType) {
      case 'application/pdf':
        text = await extractTextFromPDF(buffer);
        break;
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        text = await extractTextFromDOCX(buffer);
        break;
      case 'text/plain':
        text = await extractTextFromTXT(file);
        break;
      default:
        throw new Error('Unsupported file type');
    }

    return text;
  } catch (error) {
    console.error('Error extracting text from file:', error);
    throw error;
  }
}

async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
  try {
    const loader = new PDFLoader(new Blob([buffer]));
    const docs = await loader.load();
    return docs.map(doc => doc.pageContent).join('\n');
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

async function extractTextFromDOCX(buffer: ArrayBuffer): Promise<string> {
  try {
    const loader = new DocxLoader(new Blob([buffer]));
    const docs = await loader.load();
    return docs.map(doc => doc.pageContent).join('\n');
  } catch (error) {
    console.error('Error parsing DOCX:', error);
    throw new Error('Failed to extract text from DOCX');
  }
}

async function extractTextFromTXT(file: File): Promise<string> {
  try {
    const loader = new TextLoader(file);
    const docs = await loader.load();
    return docs.map(doc => doc.pageContent).join('\n');
  } catch (error) {
    console.error('Error parsing TXT:', error);
    throw new Error('Failed to extract text from TXT');
  }
}

export function sanitizeText(text: string): string {
  // Remove extra whitespace and normalize line breaks
  text = text.replace(/\s+/g, ' ').trim();
  // Remove any non-printable characters
  text = text.replace(/[^\x20-\x7E]/g, '');
  // Remove any HTML tags (if present)
  text = text.replace(/<[^>]*>/g, '');
  return text;
}

export function truncateText(text: string, maxLength: number = 100000): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export async function processFile(file: File): Promise<string> {
  let text = await extractTextFromFile(file);
  text = sanitizeText(text);
  text = truncateText(text);
  return text;
}
