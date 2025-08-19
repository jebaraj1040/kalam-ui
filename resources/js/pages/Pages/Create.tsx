import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import buildSchemaMap from '@/pages/shared/buildSchemaMap';
import { toKebabCase, toSnakeCase } from '@/pages/shared/CaseConverter';
import DynamicSection, { SchemaSection } from '@/pages/shared/DynamicSection';
import ensureSectionHasIds from '@/pages/shared/ensureSectionHasIds';
import transformData from '@/pages/shared/TransformData';
import { BreadcrumbItem, Field } from '@/types';
import SchemaCard from '@/pages/shared/SchemaCard';
import { Disclosure } from '@headlessui/react';
import { Head, router } from '@inertiajs/react';
import { useEffect, useState,useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import documentDownload from '../../../../public/assets/images/document-download.svg';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface Template {
    id: string;
    template_name: string;
}

interface ComponentSchema {
    id: string;
    component_name: string;
    custom_label?: string;
    schema: SchemaSection[];
    instance_id?: string;
    local_id?: string;
}

interface ComponentFormInstance {
    uid: string;
    comp: ComponentSchema;
    data: Record<string, any>;
    schemaMap: Record<string, string>;
}

interface Language {
    id: string;
    code: string;
    name: string;
    default: boolean;
    native_name: string;
    isActive: number;
}

interface Schema {
    id: string;
    title: string;
    fields: Field[];
    children?: Schema[];
}

// const supportedLanguages = ['en', 'hi'];

export default function CreatePage({
    templates,
    breadcrumbs,
    languages,
}: {
    templates: Template[];
    breadcrumbs: BreadcrumbItem[];
    languages: Language[];
}) {
    const [pageName, setPageName] = useState('');
    const [pageSlug, setPageSlug] = useState('');
    const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
    const [slugBlur, setSlugBlur] = useState<boolean | null>(null);
    const [description, setDescription] = useState('');
    const [schemeShow,setSchemaShow] = useState(false);
    const [schema, setSchema] = useState<Schema[]>([]);
    // const [status, setStatus] = useState('Active');
    const [statusPerLang, setStatusPerLang] = useState<Record<string, string>>(() => {
        return Object.fromEntries(languages.map((lang) => [lang.code, 'Draft']));
    });
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [templateSearchTerm, setTemplateSearchTerm] = useState('');
    const [activeLang, setActiveLang] = useState(() => {
        const defaultLang = languages.find((lang) => lang.default === true);
        return defaultLang?.code || 'en';
    });
    const [availableComponentsPerLang, setAvailableComponentsPerLang] = useState<Record<string, ComponentSchema[]>>({});
    const [componentFormsPerLang, setComponentFormsPerLang] = useState<Record<string, ComponentFormInstance[]>>({});
    const [submitBtnStatus, setSubmitBtnStatus] = useState<boolean | null>(null);

    useEffect(() => {
        if (selectedTemplateId) {
            fetch(`/pages/fetch-components/${selectedTemplateId}`)
                .then((res) => res.json())
                .then((data) => {
                    const compsWithSchema = data.map((c: ComponentSchema) => ({
                        ...c,
                        local_id: uuidv4(),
                        instance_id: uuidv4(),
                        schema: c.schema.map((section) => ensureSectionHasIds(section)),
                    }));

                    const langComps: Record<string, ComponentSchema[]> = {};
                    const langForms: Record<string, ComponentFormInstance[]> = {};

                    languages.forEach((lang) => {
                        langComps[lang.code] = [...compsWithSchema];
                        langForms[lang.code] = [];
                    });

                    setAvailableComponentsPerLang(langComps);
                    setComponentFormsPerLang(langForms);
                });
        }
    }, [selectedTemplateId]);
     
    const setPageAndSlugVal = (pageVal: string) => {
        setPageName(pageVal);
        // setSlugBlur(false);
        if (!slugBlur) {
            const slug = toKebabCase(pageVal);
            setPageSlug(slug);
            checkSlug(slug);
        }
    };

    const setSlugAndAddBlur = (slugVal: string) => {
        setPageSlug(slugVal);
        checkSlug(slugVal);
        setSlugBlur(true);
    };

    const checkSlug = async (slug: string) => {
        try {
            const res = await fetch(`/check-slug/${slug}`);
            const data = await res.json();
            setSlugAvailable(data.available); // true/false from backend
            setSubmitBtnStatus(data.available);
            setTimeout(() => {
                setSlugAvailable(null);
            }, 3600);
        } catch (error) {
            console.error('Error checking slug availability:', error);
        }
    };

    const handleAddComponent = (lang: string, comp: ComponentSchema) => {
        const uid = uuidv4();
        const schemaMap = buildSchemaMap(comp.schema);
        const instanceComp = { ...comp, local_id: uuidv4(), instance_id: uuidv4() };

        const newInstance: ComponentFormInstance = {
            uid,
            comp: instanceComp,
            data: {},
            schemaMap,
        };

        setComponentFormsPerLang((prev) => ({
            ...prev,
            [lang]: [...prev[lang], newInstance],
        }));

        setAvailableComponentsPerLang((prev) => ({
            ...prev,
            [lang]: prev[lang].filter((c) => c.local_id !== comp.local_id),
        }));
    };

    const handleRemoveComponent = (lang: string, uid: string) => {
        const inst = componentFormsPerLang[lang].find((i) => i.uid === uid);
        if (!inst) return;

        setComponentFormsPerLang((prev) => ({
            ...prev,
            [lang]: prev[lang].filter((i) => i.uid !== uid),
        }));

        setAvailableComponentsPerLang((prev) => ({
            ...prev,
            [lang]: [...prev[lang], inst.comp],
        }));
    };

    const handleSubmit = () => {
        console.log('componentFormsPerLang', componentFormsPerLang['en']);
        const transformed = Object.fromEntries(
            languages.map((lang) => [
                lang.code,
                componentFormsPerLang[lang.code].map((inst) => ({
                    // uid: inst.uid,
                    // component_id: inst.comp.id,
                    // component_name: inst.comp.component_name,
                    // custom_label: inst.comp.custom_label,
                    // instance_id: inst.comp.instance_id,
                    // data: {
                    [toSnakeCase(inst.comp.custom_label || inst.comp.component_name)]: transformData(inst.data, inst.schemaMap),
                    // },
                })),
            ]),
        );
        const raw = componentFormsPerLang;

        const payload = {
            pageName,
            pageSlug,
            status: statusPerLang,
            description,
            template_id: selectedTemplateId,
            components: { data: transformed }, // For API usage
            raw_components: raw, // For EditPage pre-fill
        };

        if (submitBtnStatus) {
            router.post('/pages', payload, {
                onSuccess: () => {
                    console.log('Page created');
                },
                onError: (err) => {
                    console.error(err);
                    alert('Error creating page.');
                },
            });
        } else {
            alert('Error submitting page.');
        }
    };
    /*import component popup start*/
        const cardComponents: Component[] = [
  {
    id: 'comp1',
    component_name: 'Homepage V1',
    status: 'active',
    schema: [
      { id: 'schema1', title: 'Header' },
      { id: 'schema2', title: 'CTA' },
      { id: 'schema3', title: 'Hero' }
    ]
  },
  {
    id: 'comp2',
    component_name: 'Homepage V2',
    status: 'active',
    schema: [
      { id: 'schema1', title: 'Header' },
      { id: 'schema2', title: 'CTA' },
      { id: 'schema3', title: 'Hero' }
    ]
  },
  {
    id: 'comp3',
    component_name: 'Dashboard V3',
    status: 'active',
    schema: [
      { id: 'schema1', title: 'Header' },
      { id: 'schema2', title: 'CTA' },
      { id: 'schema3', title: 'Hero' }
    ]
  },
  {
    id: 'comp4',
    component_name: 'Services',
    status: 'active',
    schema: [
      { id: 'schema1', title: 'Header' },
      { id: 'schema2', title: 'CTA' },
      { id: 'schema3', title: 'Hero' }
    ]
  },
  {
    id: 'comp5',
    component_name: 'Homepage V5',
    status: 'archived',
    schema: [
      { id: 'schema1', title: 'Header' },
      { id: 'schema2', title: 'CTA' },
      { id: 'schema3', title: 'Hero' }
    ]
  },
  {
    id: 'comp6',
    component_name: 'Homepage V6',
    status: 'draft',
    schema: [
      { id: 'schema1', title: 'Header' },
      { id: 'schema2', title: 'CTA' },
      { id: 'schema3', title: 'Hero' }
    ]
  }
];
type Status = 'active' | 'archived' | 'draft';
interface Component {
  id: string;
  component_name: string;
  status: Status;
  schema: { id: string; title: string }[];
}
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
/*import component popup end*/
// Keep track of checked items by their id
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  // Toggle checkbox selection
  const toggleCheckbox = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id) // uncheck
        : [...prev, id] // check
    );
  };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Page" />
            <div className='flex items-center justify-between py-5 px-6'>
                <p className='text-base text-font-primary font-tree-regular'>Pages <span className='font-tree-semibold'>/ Create Page</span></p>
                <div className='flex gap-4'>
                        <Button variant={'secondary'} title='Cancel' type='button' className='w-[120px]' onClick={() => window.alert('Cancelled')} >Cancel </Button>
                        <Button variant={'default'} title='Save' type='button' className='w-[120px]' onClick={handleSubmit} >Save </Button>
                </div>
            </div>
            <div className='grid grid-cols-4 gap-6.5 h-full'>
                <div className='pageLeft p-4 bg-grey border border-border border-l-0 rounded-r-xl '>
                    <p className='text-lg font-tree-semibold text-font-secondary mb-4'>1. General information</p>
                    <div className="mb-6">
                        <label className="block text-sm font-tree-medium mb-3 text-font-secondary">Page Name <sup className='text-red'>*</sup></label>
                        <input type="text" value={pageName} onChange={(e) => setPageAndSlugVal(e.target.value)} 
                            className="form-input w-full"
                            placeholder='Enter component name'
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-tree-medium mb-3 text-font-secondary">Slug<sup className='text-red'>*</sup></label>
                        <input type="text" value={pageSlug} onChange={(e) => setSlugAndAddBlur(e.target.value)}
                            className="form-input w-full"
                            placeholder='Enter component name'
                        />
                        {slugAvailable !== null && (
                        <p className={`text-sm ${slugAvailable ? 'text-green-600' : 'text-red-600'}`}>
                            {slugAvailable ? 'Slug is available' : 'Slug is already taken'}
                        </p>
                    )}
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-tree-medium mb-3 text-font-secondary">Description</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="form-input w-full resize-none min-h-[100px]" placeholder='Describe this component'/>
                    </div>

                {selectedTemplateId && (
                    <div className="mb-4 space-y-4">
                        <div className="flex flex-wrap gap-2 border-b pb-2">
                            {languages.map((lang) => (
                                <button
                                    key={lang.id}
                                    onClick={() => setActiveLang(lang.code)}
                                    className={`rounded px-4 py-1 ${activeLang === lang.code ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                                >
                                    {`${lang.code.toUpperCase()} (${lang.name})`}
                                </button>
                            ))}
                        </div>
                        <div>
                            <label className="block font-semibold mb-2">Status for {activeLang.toUpperCase()}</label>
                            <select
                                value={statusPerLang[activeLang]}
                                onChange={(e) =>
                                    setStatusPerLang((prev) => ({
                                        ...prev,
                                        [activeLang]: e.target.value,
                                    }))
                                }
                                className="w-full rounded border p-2"
                            >
                                <option value="Draft">Draft</option>
                                <option value="Publish">Publish</option>
                            </select>
                        </div>
                    </div>
                )}

                {availableComponentsPerLang[activeLang]?.length > 0 && (
                    <>
                        {availableComponentsPerLang[activeLang].map((comp) => (
                            <div key={comp.local_id} className="mb-2 flex items-center justify-between rounded border bg-gray-50 p-2">
                                <span>
                                    {comp.custom_label} {comp.component_name}
                                </span>
                                <button onClick={() => handleAddComponent(activeLang, comp)} className="rounded bg-green-500 px-3 py-1 text-white">
                                    Add
                                </button>
                            </div>
                        ))}
                    </>
                )}

                {componentFormsPerLang[activeLang]?.map((inst) => (
                    <Disclosure key={inst.uid} defaultOpen>
                        {({ open }) => (
                            <div className="mb-4 rounded border">
                                <Disclosure.Button className="flex w-full justify-between bg-gray-200 px-4 py-2 text-left text-sm font-medium">
                                    <span>
                                        {inst.comp.custom_label} {inst.comp.component_name}
                                    </span>
                                    <span>{open ? '▲' : '▼'}</span>
                                </Disclosure.Button>
                                <Disclosure.Panel className="bg-gray-50 px-4 py-2">
                                    <div className="mb-2 flex justify-end">
                                        <button
                                            onClick={() => handleRemoveComponent(activeLang, inst.uid)}
                                            className="rounded bg-red-500 px-2 py-1 text-sm text-white"
                                        >
                                            Remove
                                        </button>
                                    </div>

                                    {inst.comp.schema.map((section) => (
                                        <DynamicSection
                                            key={`${inst.uid}-${section.id}`}
                                            section={section}
                                            data={inst.data}
                                            setData={(newData) => {
                                                setComponentFormsPerLang((prev) => ({
                                                    ...prev,
                                                    [activeLang]: prev[activeLang].map((i) => (i.uid === inst.uid ? { ...i, data: newData } : i)),
                                                }));
                                            }}
                                        />
                                    ))}
                                </Disclosure.Panel>
                            </div>
                        )}
                    </Disclosure>
                ))}
                    {/* import component popup start */}
                    <div className="mb-6">
                        <label className="block text-sm font-tree-medium  text-font-secondary mb-3">
                            Import schema from existing component
                        </label>
                        <Dialog>
                            <DialogTrigger asChild>
                                <div className="border border-dashed border-border bg-input p-5 rounded-xl cursor-pointer">
                                    <div className="max-w-[165px] mx-auto flex flex-col items-center gap-y-1 hover:cursor-pointer">
                                        <img src={documentDownload} alt="download" className="w-8 h-8" />
                                        <p className='text-sm font-tree-medium leading-5'>Import templates</p>
                                        <p className='text-xs text-center text-font-primary leading-4'>
                                            Select from previously created templates to build your page structure.
                                        </p>
                                    </div>
                                </div>
                            </DialogTrigger>
                            <DialogPortal>
                                <DialogOverlay />
                                <DialogContent className="sm:max-w-[700] lg:max-w-[976px] sm:p-10" showClose={true} closeButtonClassName="!right-2 !top-2 sm:!right-10 sm:!top-10">
                                    <DialogTitle className="text-sm sm:text-base md:text-xl mb-[2px] font-tree-medium text-[#111111] leading-[140%] ">Import schema from existing component </DialogTitle>
                                    <DialogDescription className="text-xs md:text-sm text-font-primary leading-[20px] mb-4 sm:mb-8">
                                        Select and import predefined schema structures you have built earlier
                                    </DialogDescription>
                                    {/* Your dialog content goes here */}
                                    <div className="w-full flex flex-col md:flex-row justify-between item-center gap-4 md:gap-6 mb-4 sm:mb-8 ">
                                        <div className="w-full md:max-w-[320px]">
                                                <Input
                                                    id="Company Name"
                                                    className='min-h-10 rounded-xl'
                                                    type="text"
                                                    required
                                                    autoFocus
                                                    tabIndex={1}
                                                    autoComplete="component name"
                                                    placeholder="Search by component name"
                                                />
                                                <InputError message={''} />
                                        </div>
                                        <div className='flex justify-between md:justify-start gap-x-5'>
                                            <Select>
                                                <SelectTrigger className='text-sm text-font-primary min-w-[140px] justify-between font-tree-medium'>
                                                    <SelectValue placeholder="Last modified"/>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem className='text-sm text-font-primary' value='yesterday'>Yesterday</SelectItem>
                                                    <SelectItem className='text-sm text-font-primary' value='last month'>Last Month</SelectItem>
                                                    <SelectItem className='text-sm text-font-primary' value='last year'>Last Year</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Select>
                                                <SelectTrigger className='text-sm text-font-primary font-tree-medium'>
                                                    <SelectValue placeholder="Status"/>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem className='text-sm text-font-primary' value='Active'>Active</SelectItem>
                                                    <SelectItem className='text-sm text-font-primary' value='Archived'>Archived</SelectItem>
                                                    <SelectItem className='text-sm text-font-primary' value='Draft'>Draft</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="max-h-[330px] md:max-h-[280px] overflow-y-auto mb-4 md:mb-8 scrollbar-thin pr-2">
                                    <div className="grid grid-cols-12 gap-4 mb-1">
                                        {cardComponents.map((comp) => (
                                            <div className="col-span-12 md:col-span-4" key={comp.id}>
                                                <Card className="rounded-xl border-[#e1e1e1] p-4">
                                                    <CardContent className='p-0'>
                                                        <Avatar className="size-full overflow-hidden rounded-xl mb-4">
                                                            <AvatarImage src="/assets/images/icons/list.svg" className='aspect-auto' alt="list" />
                                                        </Avatar>
                                                        <div className="flex items-center space-x-2 mb-2">
                                                            <Checkbox
                                                                className='data-[state=checked]:bg-primary'
                                                                tickClassName="!text-white"
                                                                id={comp.id}
                                                                name={comp.component_name}
                                                                checked={checkedIds.includes(comp.id)}
                                                                onClick={() => toggleCheckbox(comp.id)}
                                                                tabIndex={3}
                                                            />
                                                            <Label htmlFor={comp.id} className='text-sm font-tree-medium text-[#111]'>
                                                                {comp.component_name}
                                                            </Label>
                                                            <Badge
                                                            variant="default"
                                                            className={`
                                                                p-2 uppercase font-tree-semibold text-[10px] rounded before:content-[''] before:inline-block before:w-[6px] before:h-[6px] before:rounded-full before:mr-[6px] tracking-[1px] leading-1 gap-0
                                                                ${statusStyles[comp.status]?.bg || 'bg-gray-200'}
                                                                ${statusStyles[comp.status]?.text || 'text-gray-700'}
                                                                ${statusStyles[comp.status]?.dot || 'before:bg-gray-700'}
                                                            `}
                                                            >
                                                            {comp.status}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-x-2 ml-[22px]">
                                                            {comp.schema.map((s) => (
                                                                <Badge key={s.id} variant="default" className="px-2 py-1 bg-white capitalize font-regular text-xs text-[#111] border border-[#e1e1e1] rounded-4xl">
                                                                    {s.title}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        ))}
                                    </div>
                                    </div>
                                    <div className='w-full flex justify-end gap-4 md:gap-6'>
                                        <Button variant={'secondary'} title='Cancel' type='button' className='w-1/2 md:w-[120px]' >Cancel </Button>
                                        <Button variant={'default'} title='Save' type='button' className='w-1/2 md:w-[120px]' >Import </Button>
                                    </div>
                                    <DialogClose asChild></DialogClose>
                                </DialogContent>
                            </DialogPortal>
                        </Dialog>
                    </div>
                    {/* import component popup end */}
                </div>
                <div className='pageRight px-6 py-4 bg-grey border border-border border-r-0 rounded-l-xl col-span-3'>
                    <p className='text-lg font-tree-semibold text-font-secondary  mb-4'>2. Templates</p>
                    <div className="grid grid-cols-3">
                     <div className="relative mb-6">
                    <label className="block text-sm font-tree-medium mb-3 text-font-secondary">Search and Add Template</label>
                    <input
                        type="text"
                        placeholder="Search templates..."
                        value={templateSearchTerm}
                        onChange={(e) => setTemplateSearchTerm(e.target.value)}
                        className="w-full form-input"
                    />
                    {templateSearchTerm.trim() && (
                        <div className="absolute mt-1 max-h-48 w-full overflow-y-auto  border bg-input  rounded-xl">
                            {templates
                                .filter((t) => t.template_name.toLowerCase().includes(templateSearchTerm.toLowerCase()))
                                .map((t) => (
                                    <div
                                        key={t.id}
                                        onClick={() => {
                                            setSelectedTemplateId(t.id);
                                            // setPageName(t.template_name);
                                            setTemplateSearchTerm('');
                                        }}
                                        className="cursor-pointer p-2 text-popover-foreground  hover:bg-accent hover:text-accent-foreground"
                                    >
                                        {t.template_name}
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
                </div>
                </div>
            </div>
        </AppLayout>
    );
}
