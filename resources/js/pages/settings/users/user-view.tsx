import { Head ,router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Button } from '@/components/ui/button';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type Props = {
  users: User[];
};

export default function UserView({ users }: Props) {
    const handleEdit = (userId: string) => {
        router.get(route('settings.users.edit', userId));
    };
    
    const handleDelete = (userId: string) => {
        if (confirm('Are you sure you want to delete this user?')) {
            router.delete(route('settings.users.destroy', userId), {
            preserveScroll: true,
            });
        }
    };

    const handleAddUser = () => {
     router.visit(route('settings.users.add'));
    }; 

  return (
    <AppLayout>
      <Head title="User List" />
      <SettingsLayout>
        <div className="mb-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold">Users</h1>
             <Button onClick={handleAddUser}>Add User</Button> 
          </div>

        <table className="min-w-full table-auto border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2 text-left">Name</th>
              <th className="border px-4 py-2 text-left">Email</th>
              <th className="border px-4 py-2 text-left">Role</th>
              <th className="border border-gray-300 px-4 py-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{user.name}</td>
                <td className="border px-4 py-2">{user.email}</td>
                <td className="border px-4 py-2">{user.role}</td>
                <td className="border border-gray-300 px-4 py-2 text-center space-x-2">
                      <button
                        onClick={() => handleEdit(user.id)}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
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
