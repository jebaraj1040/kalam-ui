import AppLayout from '@/layouts/app-layout';
import buildSchemaMap from '@/pages/shared/buildSchemaMap';
import DynamicSection, { SchemaSection } from '@/pages/shared/DynamicSection';
import ensureSectionHasIds from '@/pages/shared/ensureSectionHasIds';
import transformData from '@/pages/shared/TransformData';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toSnakeCase } from '../shared/CaseConverter';

interface PageData {
    id: number;
    page_name: string;
    description: string | null;
    status: any;
    template_id: string;
    raw_components: string; // JSON string
}

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

interface Props {
    page: PageData;
    templates: Template[];
    breadcrumbs: BreadcrumbItem[];
    languages: Language[];
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
    isActive: Number;
}

export default function EditPage({ page, breadcrumbs, languages }: Props) {
    const [pageName, setPageName] = useState(page.page_name);
    const [description, setDescription] = useState(page.description || '');
    // const [status, setStatus] = useState(page.status);
    const [statusPerLang, setStatusPerLang] = useState<Record<string, string>>(() => {
        return typeof page.status === 'object' ? page.status : {};
    });
    const [selectedTemplateId, setSelectedTemplateId] = useState(page.template_id);
    const [removedInstancesPerLang, setRemovedInstancesPerLang] = useState<Record<string, ComponentSchema[]>>({});
    const [componentFormsPerLang, setComponentFormsPerLang] = useState<Record<string, ComponentFormInstance[]>>({});
    const [availableComponentsPerLang, setAvailableComponentsPerLang] = useState<Record<string, ComponentSchema[]>>({});
    const [activeLang, setActiveLang] = useState(() => {
        const defaultLang = languages.find((lang) => lang.default === true);
        return defaultLang?.code || 'en';
    });

    // Load available components on template select
    useEffect(() => {
        if (!selectedTemplateId) return;

        const raw = typeof page.raw_components === 'string' ? JSON.parse(page.raw_components) : page.raw_components;

        fetch(`/pages/fetch-components/${selectedTemplateId}`)
            .then((res) => res.json())
            .then((templateComponents: ComponentSchema[]) => {
                const available: Record<string, ComponentSchema[]> = {};

                languages.forEach((lang) => {
                    const rawInLang = raw?.[lang.code] || [];

                    const usedKeySet = new Set(rawInLang.map((item: any) => `${item.comp?.id}-${item.comp?.custom_label}`));

                    available[lang.code] = templateComponents
                        .filter((comp) => {
                            const key = `${comp.id}-${comp.custom_label}`;
                            return !usedKeySet.has(key);
                        })
                        .map((comp) => ({
                            ...comp,
                            local_id: uuidv4(),
                            instance_id: uuidv4(),
                            schema: (comp.schema || []).map((s) => ensureSectionHasIds(s)),
                        }));
                });

                setAvailableComponentsPerLang(available);
            });
    }, [selectedTemplateId, page.raw_components]);

    // Pre-fill component forms from raw_components
    useEffect(() => {
        if (page.raw_components) {
            try {
                const raw = typeof page.raw_components === 'string' ? JSON.parse(page.raw_components) : page.raw_components;

                const formsPerLang: Record<string, ComponentFormInstance[]> = {};
                languages.forEach((lang) => {
                    const rawForLang = raw[lang.code] || [];
                    formsPerLang[lang.code] = rawForLang.map((inst: any) => {
                        const schemaWithIds = inst.comp.schema.map((s: SchemaSection) => ensureSectionHasIds(s));
                        return {
                            uid: inst.uid,
                            comp: {
                                ...inst.comp,
                                schema: schemaWithIds,
                                local_id: inst.comp.local_id || uuidv4(),
                                instance_id: inst.comp.instance_id || uuidv4(),
                            },
                            data: inst.data,
                            schemaMap: buildSchemaMap(schemaWithIds),
                        };
                    });
                });
                setComponentFormsPerLang(formsPerLang);
            } catch (e) {
                console.error('Failed to parse raw_components', e);
            }
        }
    }, [page.raw_components]);

    const handleRemoveComponent = (lang: string, uid: string) => {
        const instance = componentFormsPerLang[lang]?.find((i) => i.uid === uid);
        if (!instance) return;

        // Save to removedInstancesPerLang
        setRemovedInstancesPerLang((prev) => ({
            ...prev,
            [lang]: [...(prev[lang] || []), instance.comp],
        }));

        // Remove from componentForms
        setComponentFormsPerLang((prev) => ({
            ...prev,
            [lang]: prev[lang].filter((i) => i.uid !== uid),
        }));

        // Re-add to available list
        setAvailableComponentsPerLang((prev) => ({
            ...prev,
            [lang]: [...(prev[lang] || []), instance.comp],
        }));
    };

    const handleAddComponent = (lang: string, comp: ComponentSchema) => {
        const removed = removedInstancesPerLang[lang]?.find((c) => c.id === comp.id);

        const newInstance = {
            ...comp,
            instance_id: removed?.instance_id || uuidv4(), // reuse if exists
            local_id: uuidv4(),
            schema: comp.schema.map((s) => ensureSectionHasIds(s)),
        };

        const uid = uuidv4();
        const schemaMap = buildSchemaMap(newInstance.schema);

        setComponentFormsPerLang((prev) => ({
            ...prev,
            [lang]: [...(prev[lang] || []), { uid, comp: newInstance, data: {}, schemaMap }],
        }));

        // Remove from available
        setAvailableComponentsPerLang((prev) => ({
            ...prev,
            [lang]: prev[lang].filter((c) => c.local_id !== comp.local_id),
        }));

        // Remove from removedInstancesPerLang
        setRemovedInstancesPerLang((prev) => ({
            ...prev,
            [lang]: (prev[lang] || []).filter((c) => c.id !== comp.id),
        }));
    };

    const handleUpdate = () => {
        const transformed = Object.fromEntries(
            languages.map((lang) => [
                lang.code,
                componentFormsPerLang[lang.code]?.map((inst) => ({
                    // uid: inst.uid,
                    // component_id: inst.comp.id,
                    // component_name: inst.comp.component_name,
                    // custom_label: inst.comp.custom_label,
                    // instance_id: inst.comp.instance_id,
                    // data: {
                    [toSnakeCase(inst.comp.custom_label || inst.comp.component_name)]: transformData(inst.data, inst.schemaMap),
                    // },
                })) || [],
            ]),
        );
        const raw = componentFormsPerLang;

        const payload = {
            id: page.id,
            pageName,
            description,
            status: statusPerLang,
            template_id: selectedTemplateId,
            components: { data: transformed },
            raw_components: raw,
        };

        router.put(`/pages/${page.id}`, payload, {
            onSuccess: () => console.log('Page updated'),
            onError: (err) => {
                console.error(err);
                alert('Error updating page.');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Page" />

            <div className="p-4">
                <h1 className="mb-4 text-2xl font-bold">Edit Page</h1>

                <div className="mb-4">
                    <label className="block font-medium">Page Name</label>
                    <input
                        type="text"
                        value={pageName}
                        onChange={(e) => setPageName(e.target.value)}
                        className="w-full rounded border p-2"
                        disabled
                    />
                </div>

                {/* <div className="mb-4">
                    <label className="block font-medium">Status</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded border p-2">
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div> */}

                <div className="mb-4">
                    <label className="block font-medium">Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded border p-2" />
                </div>

                {/* Language Switch */}
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
                        <label className="mb-2 block font-semibold">Status for {activeLang.toUpperCase()}</label>
                        <select
                            value={statusPerLang[activeLang] || 'Draft'}
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

                {/* Component List */}
                {availableComponentsPerLang[activeLang]?.map((comp) => (
                    <div key={comp.local_id} className="mb-2 flex items-center justify-between rounded border bg-gray-100 p-2">
                        <span>{comp.custom_label || comp.component_name}</span>
                        <button onClick={() => handleAddComponent(activeLang, comp)} className="text-blue-600 hover:underline">
                            Add
                        </button>
                    </div>
                ))}

                {/* Component Forms */}
                {componentFormsPerLang[activeLang]?.map((inst) => (
                    <div key={inst.uid} className="mb-4 rounded border bg-gray-100 p-4">
                        <div className="mb-2 flex justify-between">
                            <h3 className="text-lg font-semibold">{inst.comp.custom_label || inst.comp.component_name}</h3>
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
                    </div>
                ))}

                <div className="mt-6 flex gap-4">
                    <button onClick={() => window.history.back()} className="rounded bg-gray-300 px-4 py-2">
                        Cancel
                    </button>
                    <button onClick={handleUpdate} className="rounded bg-blue-600 px-4 py-2 text-white">
                        Update Page
                    </button>
                </div>
            </div>
        </AppLayout>
    );
}
