import AppLayout from '@/layouts/app-layout';
import { useForm } from '@inertiajs/react';
import axios from 'axios';
import { useState } from 'react';
import { MultiValue } from 'react-select';
import CreatableSelect from 'react-select/creatable';
import FolderSelect from '@/pages/Media/FolderSelect';
import { toast } from 'react-toastify';
import { router } from '@inertiajs/react';

type Folder = {
    id: string;
    name: string;
};

type Media = {
    id: string;
    name: string;
    path_id: string;
    tags: string[];
};

type Tag = {
    id: string;
    tagname: string;
};

type Props = {
    media: Media;
    folders: Record<string, Folder>;
    imageTags: Record<string, Tag>;
};

type OptionType = {
    value: string;
    label: string;
};

export default function EditMedia({ media, folders, imageTags }: Props) {
    const allOptions: OptionType[] = Object.entries(imageTags).map(([id, tag]) => ({
        value: id,
        label: tag.tagname,
    }));

    const selectedOptionsDefault = allOptions.filter((opt) => media.tags.includes(opt.value));
    const [folderPathId, setFolderPathId] = useState<string | null>(null);
    const [selectedOptions, setSelectedOptions] = useState<OptionType[]>(selectedOptionsDefault);
    const [inputValue, setInputValue] = useState('');
    const [menuIsOpen, setMenuIsOpen] = useState(false);

    const { data, setData, put } = useForm({
        name: media.name || '',
        path_id: media.path_id || '',
        tags: media.tags || [],
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const selectedTagIds = selectedOptions.map((tag) => tag.value);

        const formData = {
            path_id: folderPathId ?? media.path_id,
            image_tags: selectedTagIds,
        };

        try {
            await axios.put(`/media/${media.id}`, formData);
            toast.success('media data update success');
            console.log('Tags and path updated successfully');
            router.visit('/media');
        } catch (error) {
            toast.success('failed to update  media data');
            console.error('Error updating tags and path:', error);
        }
    };

    const handleChange = (newValue: MultiValue<OptionType>) => {
        const updated = newValue as OptionType[];
        setSelectedOptions(updated);
        setData(
            'tags',
            updated.map((tag) => tag.value),
        );
    };

    const handleInputChange = (newValue: string) => {
        setInputValue(newValue);
        setMenuIsOpen(newValue.length > 0);
    };

    const handleCreateOption = (inputValue: string) => {
        const newOption = { value: inputValue, label: inputValue };
        const newOptions = [...selectedOptions, newOption];
        setSelectedOptions(newOptions);
        setData(
            'tags',
            newOptions.map((tag) => tag.value),
        );
    };
    console.log(selectedOptions);
    const filteredOptions = allOptions.filter((opt) => {
        const notSelected = !selectedOptions.some((sel) => sel.value === opt.value);
        const matchesInput = opt.label.toLowerCase().includes(inputValue.toLowerCase());
        return notSelected && matchesInput;
    });

    return (
        <AppLayout>
            <form onSubmit={handleSubmit} className="space-y-4 p-8">
                <div>
                    <label className="mb-1 block">Name:</label>
                    <p>{data.name}</p>
                </div>

                <div>
                    <label className="mb-1 block">Select Folder:</label>
                    <FolderSelect
                        folders={Object.values(folders)} 
                        value={folderPathId ?? media.path_id}
                        onChange={(val: string | null) => setFolderPathId(val)}
                        placeholder="-- Select Folder --"
                    />
                </div>

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
                        onCreateOption={handleCreateOption}
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
                    />
                </div>

                <button type="submit" className="bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
                    Save
                </button>
            </form>
        </AppLayout>
    );
}
