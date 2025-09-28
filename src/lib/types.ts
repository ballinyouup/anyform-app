export interface AppOutput {
    summary?: string;
    images?: string[];
    webSearchResults?: string[];
}

export type InputType = 'file' | 'text' | 'websearch';