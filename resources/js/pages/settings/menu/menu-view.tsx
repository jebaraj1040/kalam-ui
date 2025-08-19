import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Head, router, usePage } from '@inertiajs/react';

type MenuItem = {
    id: string;
    name: string;
    href: string;
    parent: string | null;
};

type Props = {
    menus: MenuItem[];
};

export default function MenuView({ menus }: Props) {
  const { authPermissions } = usePage().props as any;

  const canAdd = authPermissions?.Media?.add;
  const canEdit = authPermissions?.Media?.edit;
  const canDelete = authPermissions?.Media?.delete;

    const handleEdit = (menuId: string) => {
        router.get(route('menu.edit', menuId));
    };

    const handleDelete = (menuId: string) => {
        if (confirm('Are you sure you want to delete this menu item?')) {
            router.delete(route('menu.destroy', menuId), {
                preserveScroll: true,
            });
        }
    };

    const handleAddMenu = () => {
        router.visit(route('menu.add'));
    };

    return (
        <AppLayout>
            <Head title="Menus" />
            <SettingsLayout>
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Menu Items</h1>
                    {canAdd &&<Button onClick={handleAddMenu}>Add Menu</Button>}
                </div>

                <table className="min-w-full table-auto border-collapse border border-gray-300">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border px-4 py-2 text-left">Name</th>
                            <th className="border px-4 py-2 text-left">Href</th>
                            <th className="border px-4 py-2 text-left">Parent</th>
                            <th className="border px-4 py-2 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {menus.map((menu) => (
                            <tr key={menu.id} className="hover:bg-gray-50">
                                <td className="border px-4 py-2">{menu.name}</td>
                                <td className="border px-4 py-2">{menu.href}</td>
                                <td className="border px-4 py-2">{menu.parent ?? '-'}</td>
                                <td className="space-x-2 border px-4 py-2 text-center">
                                  {canEdit && (
                                    <button onClick={() => handleEdit(menu.id)} className="text-blue-600 hover:underline">
                                        Edit
                                    </button>
                                  )}
                                  {canDelete && (  
                                    <button onClick={() => handleDelete(menu.id)} className="text-red-600 hover:underline">
                                        Delete
                                    </button>
                                  )}  
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </SettingsLayout>
        </AppLayout>
    );
}
