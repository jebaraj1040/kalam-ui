import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect, useRef, type ReactNode } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export interface SharedProps {
    flash?: {
        success?: string;
        error?: string;
    };
    [key: string]: unknown;
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
    const { flash } = usePage<SharedProps>().props;
    const lastFlash = useRef<{
        success?: string;
        error?: string;
    }>({});
    useEffect(() => {
        if (flash?.success && flash.success !== lastFlash.current.success) {
            toast.success(flash.success);
            lastFlash.current.success = flash.success;
        }

        if (flash?.error && flash.error !== lastFlash.current.error) {
            toast.error(flash.error);
            lastFlash.current.error = flash.error;
        }
    }, [flash?.success, flash?.error]);

    return (
        <>
            <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
                {children}
            </AppLayoutTemplate>
            <ToastContainer position="top-center" hideProgressBar={true} closeButton={false}/>
        </>
    );
};
