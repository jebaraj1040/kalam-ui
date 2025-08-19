import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { router } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';

type Role = {
  id: string;
  name: string;
  description: string;
  user_count: number; 
};

type Props = {
  roles: Role[];
};

export default function RolesPage({ roles }: Props) {

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
          <div className="mb-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold">Roles</h1>
            <Button onClick={handleAddRole}>Add Role</Button>
          </div>  

          <table className="min-w-full table-auto border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Users</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {roles.map((role) => (
                <tr key={role.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{role.name}</td>
                  <td className="border border-gray-300 px-4 py-2">{role.description}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{role.user_count}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center space-x-2">
                    <button
                      onClick={() => handleEdit(role.id)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(role.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </SettingsLayout>
    </AppLayout>
  );
}
