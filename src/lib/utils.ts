import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Initialize PDF.js only on client side to avoid SSR issues
let pdfjsLib: any = null;

const initializePdfJs = async () => {
  if (typeof window !== 'undefined' && !pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist');
    // Tell pdfjs where the worker is - using local worker file for reliability
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
  }
  return pdfjsLib;
};

/**
 * Converts a File object to a Base64 encoded string.
 */
export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};

/**
 * Extracts text content from a PDF file.
 */
export const extractTextFromPdf = async (file: File): Promise<string> => {
    // Initialize PDF.js on client side only
    const pdfjs = await initializePdfJs();
    if (!pdfjs) {
        throw new Error('PDF.js could not be initialized. This function only works in the browser.');
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;
    let fullText = "";

    for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map((item: any) => item.str).join(" ") + "\n";
    }

    return fullText;
};
