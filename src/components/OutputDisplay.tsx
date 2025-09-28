
import React from 'react';
import type { AppOutput } from '@/lib/types';
import { AudioPlayer } from './AudioPlayer';

interface OutputDisplayProps {
    output: AppOutput;
}

export const OutputDisplay: React.FC<OutputDisplayProps> = ({ output }) => {
    return (
        <div className="space-y-8">
            {output.summary && (
                <section>
                    <h2 className="text-2xl font-bold text-text-primary mb-4">Summary & Audio</h2>
                    <div className="bg-base-100 p-6 rounded-lg space-y-4">
                        <p className="text-text-secondary leading-relaxed">{output.summary}</p>
                        <AudioPlayer text={output.summary} />
                    </div>
                </section>
            )}

            {output.webSearchResults && output.webSearchResults.length > 0 && (
                <section>
                    <h2 className="text-2xl font-bold text-text-primary mb-4">Sources</h2>
                    <div className="bg-base-100 p-4 rounded-lg">
                        <div className="flex flex-wrap gap-2">
                            {output.webSearchResults.map((result, index) => {
                                const [title, url] = result.split(': ');
                                return (
                                    <a
                                        key={index}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-800 text-sm rounded-full transition-colors duration-200"
                                        title={title || 'Unknown source'}
                                    >
                                        <span className="font-medium mr-1">[{index + 1}]</span>
                                        <span className="truncate max-w-[200px]">
                                            {title || 'Unknown source'}
                                        </span>
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {output.images && output.images.length > 0 && (
                <section>
                    <h2 className="text-2xl font-bold text-text-primary mb-4">Generated Images</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {output.images.map((imageSrc, index) => (
                            <div key={index} className="overflow-hidden rounded-lg shadow-lg">
                                <img
                                    src={imageSrc}
                                    alt={`Generated content ${index + 1}`}
                                    className="w-full h-full object-cover aspect-video transition-transform duration-300 hover:scale-105"
                                />
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};
