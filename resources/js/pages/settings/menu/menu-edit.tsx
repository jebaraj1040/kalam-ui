import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

type Menu = {
    id: string;
    name: string;
    href: string;
    parent: string | null;
};

type Props = {
    menu: Menu;
};

export default function MenuEdit({ menu }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: menu.name,
        href: menu.href,
        parent: menu.parent ?? '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('menu.update', menu.id));
    };

    return (
        <AppLayout>
            <Head title={`Edit Menu - ${menu.name}`} />
            <SettingsLayout>
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Edit Menu</h1>
                    <Link href={route('menu.index')} as="button">
                        Back
                    </Link>
                </div>

                <form onSubmit={submit} className="flex max-w-lg flex-col gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Menu Name</Label>
                        <Input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                            required
                            placeholder="Menu Name"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="href">Href</Label>
                        <Input
                            id="href"
                            type="text"
                            value={data.href}
                            onChange={(e) => setData('href', e.target.value)}
                            disabled={processing}
                            required
                            placeholder="Menu Href"
                        />
                        <InputError message={errors.href} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="parent">Parent</Label>
                        <Input
                            id="parent"
                            type="text"
                            value={data.parent}
                            onChange={(e) => setData('parent', e.target.value)}
                            disabled={processing}
                            placeholder="Parent ID"
                        />
                        <InputError message={errors.parent} />
                    </div>

                    <Button type="submit" disabled={processing}>
                        {processing ? 'Saving...' : 'Save Changes'}
                    </Button>
                </form>
            </SettingsLayout>
        </AppLayout>
    );
}
