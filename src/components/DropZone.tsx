
import React, { useState, useCallback, useRef } from 'react';
import type { InputType } from '@/lib//types';
import { FileIcon } from './icons/FileIcon';
import { ImageIcon } from './icons/ImageIcon';
import { AudioIcon } from './icons/AudioIcon';

interface DropZoneProps {
    inputType: InputType;
    setInputType: (type: InputType) => void;
    inputFile: File | null;
    setInputFile: (file: File | null) => void;
    inputText: string;
    setInputText: (text: string) => void;
    onGenerate: () => void;
    isLoading: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({
                                                      inputType,
                                                      setInputType,
                                                      inputFile,
                                                      setInputFile,
                                                      inputText,
                                                      setInputText,
                                                      onGenerate,
                                                      isLoading,
                                                  }) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setInputFile(e.dataTransfer.files[0]);
        }
    }, [setInputFile]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setInputFile(e.target.files[0]);
        }
    };

    const canGenerate = (inputType === 'file' && inputFile) || (inputType === 'text' && inputText.trim().length > 0);

    return (
        <div>
            <div className="flex border-b border-base-300 mb-6">
                <TabButton id="file" label="Upload File" activeTab={inputType} setActiveTab={setInputType} />
                <TabButton id="text" label="Paste Text" activeTab={inputType} setActiveTab={setInputType} />
            </div>

            {inputType === 'file' ? (
                <div
                    className={`relative border-2 border-dashed rounded-lg p-10 text-center transition-colors duration-300 bg-white ${isDragging ? 'border-brand-primary bg-gray-50' : 'border-base-300'}`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >

                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,application/pdf,audio/*" />
                    <div className="flex flex-col items-center justify-center text-text-secondary cursor-pointer">
                        {inputFile ? (
                            <>
                                {inputFile.type.startsWith('image/') ? <ImageIcon className="w-16 h-16 mb-4"/> :
                                    inputFile.type.startsWith('audio/') ? <AudioIcon className="w-16 h-16 mb-4"/> :
                                        <FileIcon className="w-16 h-16 mb-4"/>}
                                <p className="font-semibold text-text-primary">{inputFile.name}</p>
                                <p className="text-sm">{(inputFile.size / 1024).toFixed(2)} KB</p>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setInputFile(null); }}
                                    className="mt-4 text-sm text-red-400 hover:text-red-300"
                                >
                                    Remove file
                                </button>
                            </>
                        ) : (
                            <>
                                <FileIcon className="w-16 h-16 mb-4" />
                                <p className="font-semibold text-text-primary">Drag & Drop your file here</p>
                                <p className="text-sm mt-1">or click to browse</p>
                                <p className="text-xs mt-4 text-base-300">Supported files: PDF, PNG, JPG, MP3, WAV</p>
                            </>
                        )}
                    </div>
                </div>
            ) : (
                <div>
          <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your text content here..."
              className="w-full h-48 p-4 bg-white border border-base-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition"
          />
                </div>
            )}
            <div className="mt-6 text-center">
                <button
                    onClick={onGenerate}
                    disabled={!canGenerate || isLoading}
                    className="bg-primary text-white cursor-pointer font-bold py-3 px-8 rounded-lg transition-all duration-300 ease-in-out hover:bg-brand-secondary disabled:bg-base-300 disabled:hidden disabled:scale-100 transform hover:scale-105"
                >
                    {isLoading ? 'Generating...' : 'Generate'}
                </button>
            </div>
        </div>
    );
};

interface TabButtonProps {
    id: InputType;
    label: string;
    activeTab: InputType;
    setActiveTab: (id: InputType) => void;
}

const TabButton: React.FC<TabButtonProps> = ({ id, label, activeTab, setActiveTab }) => (
    <button
        onClick={() => setActiveTab(id)}
        className={`py-2 px-6 font-medium text-sm transition-colors duration-200 ${
            activeTab === id
                ? 'border-b-2 border-purple-500 text-gray-900 bg-white'
                : 'text-gray-600 hover:text-gray-900 bg-white/80 hover:bg-gray-50'
        }`}
    >
        {label}
    </button>
);
