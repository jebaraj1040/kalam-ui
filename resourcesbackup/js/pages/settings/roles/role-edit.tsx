import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Link} from '@inertiajs/react';

type Role = {
  id: string;
  name: string;
  description: string;
};

type Props = {
  role: Role;
};

export default function RoleEdit({ role }: Props) {
  const { data, setData, put, processing, errors } = useForm({
    name: role.name,
    description: role.description,
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    put(route('roles.update', role.id));
  };

  return (
    <AppLayout>
      <Head title={`Edit Role - ${role.name}`} />
       <SettingsLayout>
        <div className="mb-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold">Edit Roles</h1>
        <Link href={route('settings.roles.index')} as="button">
            Back
        </Link>
        </div> 
      <form onSubmit={submit} className="flex flex-col gap-6 max-w-lg">
        <div className="grid gap-2">
          <Label htmlFor="name">Role Name</Label>
          <Input
            id="name"
            type="text"
            value={data.name}
            onChange={(e) => setData('name', e.target.value)}
            disabled={processing}
            required
            placeholder="Role Name"
          />
          <InputError message={errors.name} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            value={data.description}
            onChange={(e) => setData('description', e.target.value)}
            disabled={processing}
            required
            placeholder="Role Description"
            className="input resize-none h-24"
          />
          <InputError message={errors.description} />
        </div>

        <Button type="submit" disabled={processing}>
          {processing ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
      </SettingsLayout>
    </AppLayout>
  );
}
