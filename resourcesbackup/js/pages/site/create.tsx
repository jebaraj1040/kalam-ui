// import InputError from '@/Components/InputError';
// import InputLabel from '@/Components/InputLabel';
// import PrimaryButton from '@/Components/PrimaryButton';
// import SecondaryButton from '@/Components/SecondaryButton';
// import SelcetInput from '@/Components/SelcetInput';
// import TextInput from '@/Components/TextInput';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/admin-layout';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

type SiteForm = {
    name: string;
    status: string;
};

type Props = {
    breadcrumbs: BreadcrumbItem[];
};

export default function Create({ breadcrumbs }: Props) {
    const { data, setData, post, errors, processing, recentlySuccessful } = useForm<Required<SiteForm>>({
        name: '',
        status: 'active',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('admin.sites.store'), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sites" />

            <AdminLayout title="Site" description="Create a new Site">
                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>

                        <Input
                            id="name"
                            className="mt-1 block w-full"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            autoComplete="name"
                            placeholder="Site name"
                        />

                        <InputError className="mt-2" message={errors.name} />
                    </div>

                    <div className="flex items-center gap-4">
                        <Button disabled={processing}>Add</Button>

                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-in-out"
                            enterFrom="opacity-0"
                            leave="transition ease-in-out"
                            leaveTo="opacity-0"
                        >
                            <p className="text-sm text-neutral-600">Saved</p>
                        </Transition>
                    </div>

                    {/* <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 lg:grid-cols-3">
                <div>
                    <InputLabel htmlFor="name" value="Site Name" />
                    <TextInput id="name" className="mt-1 block w-full" name="name" onChange={(e) => setData('name', e.target.value)} />
                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="status" value="Status" />
                    <SelcetInput
                        className="mt-1 block w-full"
                        options={status}
                        name="status"
                        selectedValue={data.status}
                        onChange={(e) => setData('status', e.target.value)}
                    />
                    <InputError className="mt-2" message={errors.status} />
                </div>
            </div>
            <div className="!mt-10 !mb-0 flex flex-col items-center gap-4 md:flex-row">
                <Link href={route('cms.dynamo.sites.index')} className="w-full md:w-auto">
                    <SecondaryButton>Cancel</SecondaryButton>
                </Link>
                <PrimaryButton disabled={processing}>Create</PrimaryButton>
            </div> */}
                </form>
            </AdminLayout>
        </AppLayout>
    );
}
