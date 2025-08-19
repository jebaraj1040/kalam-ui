import FolderSelect from '@/pages/Media/FolderSelect';
import { Folder, OptionType } from '@/types';
import React, { useState } from 'react';
import { ActionMeta, MultiValue } from 'react-select';
import CreatableSelect from 'react-select/creatable';

type UploadSectionProps = {
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    selectedFile: File | null;
    setSelectedFile: (file: File | null) => void;
    showTextInput: boolean;
    setShowTextInput: (show: boolean) => void;
    cdnUrl: string;
    setCdnUrl: (url: string) => void;
    folderPathId: string |null;
    setFolderPathId: (id: string | null) => void;
    folders: Folder[];
    options: OptionType[];
    selectedOptions: OptionType[];
    setSelectedOptions: React.Dispatch<React.SetStateAction<OptionType[]>>;
    setOptions: React.Dispatch<React.SetStateAction<OptionType[]>>;
    newlyCreatedOptions: string[];
    setNewlyCreatedOptions: React.Dispatch<React.SetStateAction<string[]>>;
    handleChange: (newValue: MultiValue<OptionType>, actionMeta: ActionMeta<OptionType>) => void;
    handleSubmit: () => void;
};
const UploadSection = ({
    fileInputRef,
    selectedFile,
    setSelectedFile,
    showTextInput,
    setShowTextInput,
    cdnUrl,
    setCdnUrl,
    folderPathId,
    setFolderPathId,
    folders,
    options,
    setOptions,
    selectedOptions,
    setSelectedOptions,
    newlyCreatedOptions,
    setNewlyCreatedOptions,
    handleChange,
    handleSubmit,
}: UploadSectionProps) => {
    const [inputValue, setInputValue] = useState('');
    const [menuIsOpen, setMenuIsOpen] = useState(false);
    const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(inputValue.toLowerCase()));
    const [imagePreviewUrl, setImagePreviewUrl] = useState('');

    const handleInputChange = (value: string) => {
        setInputValue(value);
        setMenuIsOpen(value.trim() !== '');
    };
    const handleCreateOption = (input: string) => {
        const trimmed = input.trim();

        if (trimmed.length < 2) {
            alert('Please enter at least 2 characters');
            return;
        }

        const exists = options.some((opt) => opt.label.toLowerCase() === trimmed.toLowerCase());
        if (exists) {
            alert('This tag already exists');
            return;
        }

        const newOption = { label: trimmed, value: trimmed };
        setOptions((prev) => [...prev, newOption]);
        setSelectedOptions((prev) => [...prev, newOption]);
        setNewlyCreatedOptions((prev) => [...prev, newOption.value]);
        setInputValue('');
    };
    console.log(newlyCreatedOptions);

    return (
        <div className="rounded-xl bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-semibold">Upload File or CDN</h2>
            <div className="mb-4 flex gap-3">
                <button
                    onClick={() => {
                        fileInputRef.current?.click();
                        setShowTextInput(false);
                    }}
                    className={`rounded px-4 py-2 text-white hover:bg-blue-700 ${showTextInput ? 'bg-blue-600 opacity-50' : 'bg-blue-600'}`}
                >
                    Upload File
                </button>
                <button
                    onClick={() => {
                        setSelectedFile(null);
                        setShowTextInput(true);
                    }}
                    className={`rounded px-4 py-2 text-white hover:bg-cyan-700 ${showTextInput ? 'bg-cyan-600' : 'bg-cyan-600 opacity-50'}`}
                >
                    From CDN URL
                </button>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setSelectedFile(file);
                }}
            />

            {selectedFile && (
                <p className="mb-2 text-sm text-gray-700">
                    Selected file: <strong>{selectedFile.name}</strong>
                </p>
            )}
            {showTextInput && (
                <div className="mt-4">
                    <input
                        type="text"
                        placeholder="Enter CDN URL"
                        value={cdnUrl}
                        onChange={(e) => {
                            setCdnUrl(e.target.value);
                            setImagePreviewUrl(e.target.value); 
                        }}
                        className="mb-3 w-full rounded-md border px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />

                    {imagePreviewUrl && (
                        <img
                            src={imagePreviewUrl}
                            alt="CDN Preview"
                            className="max-h-32 w-auto rounded border shadow"
                            onError={() => setImagePreviewUrl('')} 
                        />
                    )}
                </div>
            )}

            <FolderSelect
                folders={folders}
                value={folderPathId}
                onChange={(val: string | null) => setFolderPathId(val)}
                placeholder="-- Select Destination Folder --"
            />

            <div className="mb-6 w-md">
                <CreatableSelect<OptionType, true>
                    isMulti
                    options={filteredOptions}
                    value={selectedOptions}
                    onChange={handleChange}
                    placeholder="Add image tags..."
                    inputValue={inputValue}
                    onInputChange={handleInputChange}
                    menuIsOpen={menuIsOpen}
                    styles={{
                        multiValue: (base) => ({
                            ...base,
                            backgroundColor: '#e9e9ff',
                            color: '#333',
                        }),
                        multiValueLabel: (base) => ({
                            ...base,
                            color: '#333',
                        }),
                        multiValueRemove: (base) => ({
                            ...base,
                            cursor: 'pointer',
                            ':hover': {
                                backgroundColor: '#a78bfa',
                                color: 'white',
                            },
                        }),
                    }}
                    onCreateOption={handleCreateOption}
                />
            </div>

            <button onClick={handleSubmit} className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                Upload
            </button>
        </div>
    );
};

export default UploadSection;
