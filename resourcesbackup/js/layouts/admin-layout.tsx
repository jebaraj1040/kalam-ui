import Heading from '@/components/heading';
import { type PropsWithChildren } from 'react';

type AdminLayoutProps = {
    title?: string;
    description?: string;
};

export default function AdminLayout({
    children,
    title = 'Settings',
    description = 'Manage your profile and account settings',
}: PropsWithChildren<AdminLayoutProps>) {
    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null;
    }

    return (
        <div className="px-4 py-6">
            <Heading title={title} description={description} />

            {/* <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
                <div className="flex-1 md:max-w-2xl"> */}
            <section className="space-y-12">{children}</section>
            {/* </div>
            </div> */}
        </div>
    );
}
