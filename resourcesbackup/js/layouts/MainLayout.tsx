// resources/js/Layouts/MainLayout.tsx
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function MainLayout({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col bg-gray-100 text-gray-900">
            {/* Top Horizontal Navigation */}
            <header className="bg-blue-600 text-white">
                <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
                    <h1 className="text-xl font-bold">My App</h1>
                    <ul className="flex space-x-6">
                        <li>
                            <Link href="/dashboard" className="hover:underline">
                                Dashboard
                            </Link>
                        </li>
                        <li>
                            <Link href="/profile" className="hover:underline">
                                Profile
                            </Link>
                        </li>
                        <li>
                            <Link href="/settings" className="hover:underline">
                                Settings
                            </Link>
                        </li>
                    </ul>
                </nav>
            </header>

            {/* Page Content */}
            <main className="flex-1 p-8">{children}</main>

            {/* Footer */}
            <footer className="p-4 text-center text-gray-500">© 2025 MyApp</footer>
        </div>
    );
}
