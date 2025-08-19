import { X } from 'lucide-react';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface Tag {
    id: string;
    name: string;
    type: string;
}

export default function TagInput({ availableTags = [], value, onChange }: { availableTags?: Tag[]; value: Tag[]; onChange: (tags: Tag[]) => void }) {
    console.log('availableTags', availableTags);
    const [input, setInput] = useState('');

    const addTag = (tagName: string) => {
        if (!tagName.trim()) return;
        const cleaned = tagName.trim().toLowerCase();

        // Check if already exists in selected value
        const exists = value.some((tag) => tag.name.toLowerCase() === cleaned);
        if (exists) return;

        // Check if tag exists in availableTags
        const existingTag = availableTags.find((t) => t.name.toLowerCase() === cleaned);
        if (existingTag) {
            onChange([...value, existingTag]);
        } else {
            // Create new tag
            const newTag: Tag = {
                id: uuidv4(),
                name: tagName.trim(),
                type: 'component', // or default type
            };
            onChange([...value, newTag]);
        }

        setInput('');
    };

    const removeTag = (tag: Tag) => {
        onChange(value.filter((t) => t.id !== tag.id));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag(input);
        }
    };

    const filteredSuggestions = availableTags.filter((t) => t.name.toLowerCase().includes(input.toLowerCase()) && !value.some((v) => v.id === t.id));

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
                {value.map((tag) => (
                    <div key={tag.id} className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                        {tag.name}
                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-600">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>

            <textarea
                className="form-input min-h-[100px] w-full resize-none"
                placeholder="Add relevant tags"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
            />

            {input && filteredSuggestions.length > 0 && (
                <ul className="mt-1 rounded border bg-white shadow">
                    {filteredSuggestions.map((tag) => (
                        <li
                            key={tag.id}
                            className="cursor-pointer px-3 py-1 hover:bg-gray-100"
                            onClick={() => {
                                onChange([...value, tag]);
                                setInput('');
                            }}
                        >
                            {tag.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
