export interface AppOutput {
    summary?: string;
    images?: string[];
    webSearchResults?: string[];
    originalFile?: {
        name: string;
        url: string;
        type: string;
        size?: number;
    };
}

export type InputType = 'file' | 'text' | 'websearch';