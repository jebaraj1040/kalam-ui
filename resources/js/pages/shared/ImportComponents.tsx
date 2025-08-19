import InputError from '@/components/input-error';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogOverlay,
    DialogPortal,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Field } from '@/types';
import { useEffect, useState } from 'react';
import documentDownload from '../../../../public/assets/images/document-download.svg';

type Status = 'active' | 'archived' | 'draft';

interface Component {
    id: string;
    component_name: string;
    status: Status;
    schema: Schema[];
}

interface Schema {
    id: string;
    title: string;
    fields: Field[];
    children?: Schema[];
}

interface ImportComponentsProps {
    page: string;
    handleAddSchemaFromExisting: (components: Component[]) => void;
    handleAddComponent?: (component: Component) => void;
}

export default function ImportComponents({ page, handleAddSchemaFromExisting, handleAddComponent }: ImportComponentsProps) {
    const [pageName, setPageName] = useState(page);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [checkedIds, setCheckedIds] = useState<string[]>([]); // Keep track of checked items by their id
    const [cardComponents, setCardComponents] = useState<Component[]>([]);
    const [checkedComponents, setCheckedComponents] = useState<Component[]>([]);

    const statusStyles = {
        active: {
            bg: 'bg-[#E8F5E9]',
            text: 'text-[#1B5E20]',
            dot: 'before:bg-[#1B5E20]',
        },
        archived: {
            bg: 'bg-[#FFEBEE]',
            text: 'text-[#B71C1C]',
            dot: 'before:bg-[#B71C1C]',
        },
        draft: {
            bg: 'bg-[#F6F1E0]',
            text: 'text-[#A75700]',
            dot: 'before:bg-[#A75700]',
        },
    };

    // Toggle checkbox selection
    const toggleCheckbox = (id: string) => {
        setCheckedIds(
            (prev) =>
                prev.includes(id)
                    ? prev.filter((item) => item !== id) // uncheck
                    : [...prev, id], // check
        );
        setCheckedComponents(
            (prev) =>
                prev.find((comp) => comp.id === id)
                    ? prev.filter((comp) => comp.id !== id) // uncheck
                    : [...prev, cardComponents.find((comp) => comp.id === id)!], // check
        );
    };

    // Fetch existing components matching search term for import suggestions
    useEffect(() => {
        if (!searchTerm.trim()) {
            setCardComponents([]);
            return;
        }

        setIsSearching(true);
        const controller = new AbortController();

        fetch(`/components/active?search=${encodeURIComponent(searchTerm)}`, { signal: controller.signal })
            .then((res) => res.json())
            .then((data) => setCardComponents(data))
            .catch((err) => {
                if (err.name !== 'AbortError') console.error(err);
            })
            .finally(() => setIsSearching(false));

        return () => controller.abort();
    }, [searchTerm]);

    const handleComponentsImport = () => {
        if (checkedComponents.length > 0) {
            handleAddSchemaFromExisting(checkedComponents);
        }
    };

    const handleTemplateImport = () => {};

    return (
        <div className="mb-6">
            <label className="font-tree-medium mb-3 block text-sm text-font-secondary">Import schema from existing component</label>
            <Dialog>
                <DialogTrigger asChild>
                    <div className="cursor-pointer rounded-xl border border-dashed border-border bg-input p-5">
                        <div className="mx-auto flex max-w-[165px] flex-col items-center gap-y-1 hover:cursor-pointer">
                            <img src={documentDownload} alt="download" className="h-8 w-8" />
                            <p className="font-tree-medium text-sm leading-5">Import component</p>
                            <p className="text-center text-xs leading-4 text-font-primary">Quickly reuse schema blocks you have already created</p>
                        </div>
                    </div>
                </DialogTrigger>
                <DialogPortal>
                    <DialogOverlay />
                    <DialogContent
                        className="sm:max-w-[700] sm:p-10 lg:max-w-[976px]"
                        showClose={true}
                        closeButtonClassName="!right-2 !top-2 sm:!right-10 sm:!top-10"
                    >
                        <DialogTitle className="font-tree-medium mb-[2px] text-sm leading-[140%] text-font-secondary sm:text-base md:text-xl">
                            Import schema from existing component{' '}
                        </DialogTitle>
                        <DialogDescription className="mb-4 text-xs leading-[20px] text-font-primary sm:mb-8 md:text-sm">
                            Select and import predefined schema structures you have built earlier
                        </DialogDescription>
                        {/* Your dialog content goes here */}
                        <div className="item-center mb-4 flex w-full flex-col justify-between gap-4 sm:mb-8 md:flex-row md:gap-6">
                            <div className="w-full md:max-w-[320px]">
                                <Input
                                    id="Company Name"
                                    className="min-h-10 form-input"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="component name"
                                    placeholder="Search by component name"
                                />
                                <InputError message={''} />
                            </div>
                            <div className="flex justify-between gap-x-5 md:justify-start">
                                <Select>
                                    <SelectTrigger className="font-tree-medium min-w-[140px] justify-between text-sm text-font-primary bg-input">
                                        <SelectValue placeholder="Last modified" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem className="text-sm text-font-primary" value="yesterday">
                                            Yesterday
                                        </SelectItem>
                                        <SelectItem className="text-sm text-font-primary" value="last month">
                                            Last Month
                                        </SelectItem>
                                        <SelectItem className="text-sm text-font-primary" value="last year">
                                            Last Year
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select>
                                    <SelectTrigger className="font-tree-medium text-sm text-font-primary bg-input">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem className="text-sm text-font-primary" value="Active">
                                            Active
                                        </SelectItem>
                                        <SelectItem className="text-sm text-font-primary" value="Archived">
                                            Archived
                                        </SelectItem>
                                        <SelectItem className="text-sm text-font-primary" value="Draft">
                                            Draft
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="scrollbar-thin mb-4 max-h-[330px] overflow-y-auto pr-2 md:mb-8 md:max-h-[280px]">
                            <div className="mb-1 grid grid-cols-12 gap-4">
                                {cardComponents.length > 0 ? (
                                    cardComponents.map((comp) => (
                                        <div className="col-span-12 md:col-span-4" key={comp.id}>
                                            <Card className="rounded-xl border-border p-4">
                                                <CardContent className="p-0">
                                                    <Avatar className="mb-4 size-full overflow-hidden rounded-xl">
                                                        <AvatarImage src="/assets/images/icons/list.svg" className="aspect-auto" alt="list" />
                                                    </Avatar>
                                                    <div className="mb-2 flex items-center space-x-2">
                                                        <Checkbox
                                                            className="data-[state=checked]:bg-primary"
                                                            tickClassName="!text-white"
                                                            id={comp.id}
                                                            name={comp.component_name}
                                                            checked={checkedIds.includes(comp.id)}
                                                            onClick={() => toggleCheckbox(comp.id)}
                                                            tabIndex={3}
                                                        />
                                                        <Label htmlFor={comp.id} className="font-tree-medium text-sm text-font-secondary">
                                                            {comp.component_name}
                                                        </Label>
                                                        <Badge
                                                            variant="default"
                                                            className={`font-tree-semibold gap-0 rounded p-2 text-[10px] leading-1 tracking-[1px] uppercase before:mr-[6px] before:inline-block before:h-[6px] before:w-[6px] before:rounded-full before:content-[''] ${statusStyles[comp.status]?.bg || 'bg-gray-200'} ${statusStyles[comp.status]?.text || 'text-gray-700'} ${statusStyles[comp.status]?.dot || 'before:bg-gray-700'}`}
                                                        >
                                                            {comp.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="ml-[22px] flex items-center gap-x-2">
                                                        {comp.schema.map((s) => (
                                                            <Badge
                                                                key={s.id}
                                                                variant="default"
                                                                className="font-regular rounded-4xl border border-border bg-input px-2 py-1 text-xs text-font-secondary capitalize"
                                                            >
                                                                {s.title}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-12 flex h-40 items-center justify-center text-gray-500">No search results</div>
                                )}
                            </div>
                        </div>
                        <div className="flex w-full justify-end gap-4 md:gap-6">
                            <Button variant={'secondary'} title="Cancel" type="button" className="w-1/2 md:w-[120px]">
                                Cancel{' '}
                            </Button>
                            {pageName === 'components' && (
                                <DialogClose asChild>
                                    <Button
                                        variant={'default'}
                                        title="Import"
                                        type="button"
                                        onClick={handleComponentsImport}
                                        className="w-1/2 md:w-[120px]"
                                    >
                                        Import{' '}
                                    </Button>
                                </DialogClose>
                            )}
                            {pageName === 'templates' && (
                                <DialogClose asChild>
                                    <Button
                                        variant={'default'}
                                        title="Import"
                                        type="button"
                                        onClick={handleTemplateImport}
                                        className="w-1/2 md:w-[120px]"
                                    >
                                        Import{' '}
                                    </Button>
                                </DialogClose>
                            )}
                        </div>
                        <DialogClose asChild></DialogClose>
                    </DialogContent>
                </DialogPortal>
            </Dialog>
        </div>
    );
}
