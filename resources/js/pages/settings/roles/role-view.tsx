import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Head, router, usePage } from '@inertiajs/react';
type Role = {
    id: string;
    name: string;
    description: string;
    user_count: number;
};

type Props = {
    roles: Role[];
};

type permission = 'settings.roles.create | settings.roles.edit | settings.roles.destroy';

export default function RolesPage({ roles }: Props) {
    const { permissions } = usePage().props as any;

    let permissionAdd = false;
    let permissionEdit = false;
    let permissionDel = false;

    for (const [_, value] of Object.entries(permissions)) {
        if (value.includes('settings.roles.create') as permission) permissionAdd = true;
        if (value.includes('settings.roles.edit') as permission) permissionEdit = true;
        if (value.includes('settings.roles.destroy') as permission) permissionDel = true;
    }

    const isSuperAdmin = permissions === 'all';

    const canAdd = isSuperAdmin || permissionAdd;
    const canEdit = isSuperAdmin || permissionEdit;
    const canDelete = isSuperAdmin || permissionDel;

    const handleEdit = (roleId: string) => {
        router.get(route('settings.roles.edit', roleId));
    };

    const handleDelete = (roleId: string) => {
        if (confirm('Are you sure you want to delete this role?')) {
            router.delete(route('settings.roles.destroy', roleId), {
                preserveScroll: true,
            });
        }
    };

    const handleAddRole = () => {
        router.visit(route('settings.roles.create'));
    };

    return (
        <AppLayout>
            <Head title="Roles" />
            <SettingsLayout>
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Roles</h1>
                    {canAdd && <Button onClick={handleAddRole}>Add Role</Button>}
                </div>

                <table className="min-w-full table-auto border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                            <th className="border border-gray-300 px-4 py-2 text-center">Users</th>
                            {(canEdit || canDelete) && <th className="border border-gray-300 px-4 py-2 text-center">Action</th>}
                        </tr>
                    </thead>

                    <tbody>
                        {roles.map((role) => (
                            <tr key={role.id} className="hover:bg-gray-50">
                                <td className="border border-gray-300 px-4 py-2">{role.name}</td>
                                <td className="border border-gray-300 px-4 py-2">{role.description}</td>
                                <td className="border border-gray-300 px-4 py-2 text-center">{role.user_count}</td>
                                {(canEdit || canDelete) && (
                                    <td className="space-x-2 border border-gray-300 px-4 py-2 text-center">
                                        {canEdit && (
                                            <button onClick={() => handleEdit(role.id)} className="text-blue-600 hover:underline">
                                                Edit
                                            </button>
                                        )}

                                        {canDelete && (
                                            <button onClick={() => handleDelete(role.id)} className="text-red-600 hover:underline">
                                                Delete
                                            </button>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </SettingsLayout>
        </AppLayout>
    );
}
