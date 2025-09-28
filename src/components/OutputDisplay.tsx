
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
