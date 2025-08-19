import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Link} from '@inertiajs/react';


export default function RoleAdd() {
  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    description: '',
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route('settings.roles.store'), {
      onSuccess: () => reset(),
    });
  };

  return (
    <AppLayout>
      <Head title="Add Role" />
     <SettingsLayout>
        <div className="mb-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold">Add Roles</h1>
        <Link href={route('settings.roles.index')} as="button">
            Back
        </Link>
        </div> 
      <form className="max-w-md mx-auto flex flex-col gap-6" onSubmit={submit}>
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

        <Button type="submit" disabled={processing}>
          {processing ? 'Saving...' : 'Add Role'}
        </Button>
      </form>
      </SettingsLayout>
    </AppLayout>
  );
}
