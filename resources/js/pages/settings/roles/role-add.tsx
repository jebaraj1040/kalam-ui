import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect } from 'react';

type RouteType = {
    name: string;
    uri: string;
    methods: string[];
    action: string;
};

type GroupedRoutes = Record<string, RouteType[]>;

type Props = {
    groupedRoutes: GroupedRoutes;
};

export default function RoleAdd({ groupedRoutes = {} }: Props) {
    const [selectedPermissions, setSelectedPermissions] = useState<Record<string, boolean>>({});
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
        type  : '',
        permissions: {},
    });

    useEffect(() => {
        setData('permissions', selectedPermissions);
    }, [selectedPermissions]);

    // Toggle a single permission checkbox
    function togglePermission(routeName: string) {
        setSelectedPermissions((prev) => ({
            ...prev,
            [routeName]: !prev[routeName],
        }));
    }

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('settings.roles.store'), {
            onSuccess: () => reset(),
        });
    };

    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

    function toggleGroup(groupName: string) {
        setOpenGroups((prev) => ({
            ...prev,
            [groupName]: !prev[groupName],
        }));
    }

    return (
        <AppLayout>
            <Head title="Add Role" />
            <SettingsLayout>
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Add Role</h1>
                    <Link href={route('settings.roles.index')} as="button">
                        Back
                    </Link>
                </div>
                <form className="mx-auto flex max-w-md flex-col gap-6" onSubmit={submit}>
                    <div className="grid gap-2">
                        <Label htmlFor="name">Role Name</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                            placeholder="Role name"
                        />
                        {errors.name && <p className="text-red-600">{errors.name}</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="type">Type</Label>
                        <Input
                            id="type"
                            type="text"
                            required
                            autoFocus
                            value={data.type}
                            onChange={(e) => setData('type', e.target.value)}
                            disabled={processing}
                            placeholder="Role Type"
                        />
                        {errors.type && <p className="text-red-600">{errors.type}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            type="text"
                            required
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            disabled={processing}
                            placeholder="Role description"
                        />
                        {errors.description && <p className="text-red-600">{errors.description}</p>}
                    </div>

                    <div>
                        {Object.entries(groupedRoutes).map(([groupName, routes]) => (
                            <fieldset key={groupName} className="mb-4 rounded border p-2">
                                <legend
                                    className="flex cursor-pointer items-center justify-between font-semibold"
                                    onClick={() => toggleGroup(groupName)}
                                >
                                    {groupName.charAt(0).toUpperCase() + groupName.slice(1)}
                                    <span>{openGroups[groupName] ? '▲' : '▼'}</span>
                                </legend>

                                {openGroups[groupName] && (
                                    <div className="mt-2 max-h-60 overflow-auto">
                                        {routes.map((route) => (
                                            <label key={route.name} className="mb-1 block cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="mr-2"
                                                    checked={!!selectedPermissions[route.name]}
                                                    onChange={() => togglePermission(route.name)}
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
                        {processing ? 'Saving...' : 'Add Role'}
                    </Button>
                </form>
            </SettingsLayout>
        </AppLayout>
    );
}
