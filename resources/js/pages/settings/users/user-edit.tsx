import { Head, useForm, Link } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

type Role = {
  _id: string;
  name: string;
};

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type Props = {
  user: User;
  roles: Role[];
};

export default function UserEdit({ user, roles }: Props) {
  const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        role_id: user.role,
        password: '',
        password_confirmation: '',
    })

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    put(route('settings.users.update', user.id));
  };

  return (
    <AppLayout>
      <Head title="Edit User" />
      <SettingsLayout>
        <div className="mb-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold">Edit User</h1>
        <Link href={route('settings.users.index')} as="button">
            Back
        </Link>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-6 max-w-md">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              disabled={processing}
              required
            />
            <InputError message={errors.name} />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
              disabled={processing}
              required
            />
            <InputError message={errors.email} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
                id="password"
                type="password"
                tabIndex={3}
                autoComplete="new-password"
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
                disabled={processing}
                placeholder="Password"
            />
            <InputError message={errors.password} />
            </div>

            <div className="grid gap-2">
            <Label htmlFor="password_confirmation">Confirm password</Label>
            <Input
                id="password_confirmation"
                type="password"
                tabIndex={4}
                autoComplete="new-password"
                value={data.password_confirmation}
                onChange={(e) => setData('password_confirmation', e.target.value)}
                disabled={processing}
                placeholder="Confirm password"
            />
            <InputError message={errors.password_confirmation} />
            </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <select
              id="role_id"
              value={data.role_id}
              onChange={(e) => setData('role_id', e.target.value)}
              disabled={processing}
              required
              className="input"
            >
              <option value="">-- Select Role --</option>
              {roles.map((role) => (
                <option key={role._id} value={role._id}>
                  {role.name}
                </option>
              ))}
            </select>
            <InputError message={errors.role_id} />
          </div>

          <Button type="submit" disabled={processing}>
            Update User
          </Button>
        </form>
      </SettingsLayout>
    </AppLayout>
  );
}
