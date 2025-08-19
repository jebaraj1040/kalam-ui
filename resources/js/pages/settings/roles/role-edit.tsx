import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

type RouteType = {
    name: string;
    uri: string;
    methods: string[];
    action: string;
};

type GroupedRoutes = Record<string, RouteType[]>;

type Role = {
    id: string;
    name: string;
    description: string;
    type: string;
};

type Props = {
    role: Role;
    permissions: Record<string, boolean>;
    groupedRoutes: GroupedRoutes;
};

export default function RoleEdit({ role, permissions, groupedRoutes }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: role.name,
        description: role.description,
        type: role.type,
        permissions: permissions ?? {},
    });

    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

    const toggleGroup = (group: string) => {
        setOpenGroups((prev) => ({
            ...prev,
            [group]: !prev[group],
        }));
    };

    const togglePermission = (routeName: string) => {
        setData('permissions', {
            ...data.permissions,
            [routeName]: !data.permissions?.[routeName],
        });
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('settings.roles.update', role.id));
    };

    return (
        <AppLayout>
            <Head title={`Edit Role - ${role.name}`} />
            <SettingsLayout>
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Edit Role</h1>
                    <Link href={route('settings.roles.index')} as="button">
                        Back
                    </Link>
                </div>

                <form onSubmit={submit} className="flex max-w-3xl flex-col gap-6">
                    {/* Name */}
                    <div className="grid gap-2">
                        <Label htmlFor="name">Role Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            disabled={processing}
                        />
                        {errors.name && <p className="text-red-600">{errors.name}</p>}
                    </div>

                    {/* Type */}
                    <div className="grid gap-2">
                        <Label htmlFor="type">Role Type</Label>
                        <Input
                            id="type"
                            value={data.type}
                            onChange={(e) => setData('type', e.target.value)}
                            required
                            disabled={processing}
                        />
                        {errors.type && <p className="text-red-600">{errors.type}</p>}
                    </div>

                    {/* Description */}
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            required
                            disabled={processing}
                        />
                        {errors.description && <p className="text-red-600">{errors.description}</p>}
                    </div>

                    {/* Permissions */}
                    <div className="grid gap-4">
                        <h2 className="text-lg font-medium">Route Permissions</h2>
                        {Object.entries(groupedRoutes).map(([group, routes]) => (
                            <fieldset key={group} className="border p-2 rounded">
                                <legend
                                    className="flex justify-between cursor-pointer font-semibold"
                                    onClick={() => toggleGroup(group)}
                                >
                                    {group} <span>{openGroups[group] ? '▲' : '▼'}</span>
                                </legend>

                                {openGroups[group] && (
                                    <div className="mt-2 max-h-60 overflow-y-auto space-y-1">
                                        {routes.map((route) => (
                                            <label key={route.name} className="block cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="mr-2"
                                                    checked={!!data.permissions?.[route.name]}
                                                    onChange={() => togglePermission(route.name)}
                                                    disabled={processing}
                                                />
                                                {route.name}
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </fieldset>
                        ))}
                    </div>

                    <Button type="submit" disabled={processing}>
                        {processing ? 'Saving...' : 'Save Changes'}
                    </Button>
                </form>
            </SettingsLayout>
        </AppLayout>
    );
}
