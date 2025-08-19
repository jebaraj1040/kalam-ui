import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function RoleAdd() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        href: '',
        parent: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('menu.store'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout>
            <Head title="Add Role" />
            <SettingsLayout>
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Add Menu</h1>
                    <Link href={route('menu.index')} as="button">
                        Back
                    </Link>
                </div>
                <form className="mx-auto flex max-w-md flex-col gap-6" onSubmit={submit}>
                    <div className="grid gap-2">
                        <Label htmlFor="name">Menu name</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                            placeholder="Menu name"
                        />
                        {errors.name && <p className="text-red-600">{errors.name}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Href</Label>
                        <Input
                            id="href"
                            type="text"
                            required
                            value={data.href}
                            onChange={(e) => setData('href', e.target.value)}
                            disabled={processing}
                            placeholder="Menu href"
                        />
                        {errors.href && <p className="text-red-600">{errors.href}</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">parent</Label>
                        <Input
                            id="parent"
                            type="text"
                            value={data.parent}
                            onChange={(e) => setData('parent', e.target.value)}
                            disabled={processing}
                            placeholder="Menu parent"
                        />
                        {errors.parent && <p className="text-red-600">{errors.parent}</p>}
                    </div>

                    <Button type="submit" disabled={processing}>
                        {processing ? 'Saving...' : 'Add Menu'}
                    </Button>
                </form>
            </SettingsLayout>
        </AppLayout>
    );
}
