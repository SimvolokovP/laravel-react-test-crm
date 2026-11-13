import { Outlet } from 'react-router-dom';
import type { CSSProperties } from 'react';
import { SidebarInset, SidebarProvider } from '@/shared/components/ui/sidebar';
import { RootSidebar } from './root-sidebar';
import { RootHeader } from './root-header';

export function RootLayout() {
    return (
        <SidebarProvider
            style={
                {
                    '--sidebar-width': 'calc(var(--spacing) * 72)',
                    '--header-height': 'calc(var(--spacing) * 12)',
                } as CSSProperties
            }
        >
            <RootSidebar />
            <SidebarInset>
                <RootHeader />
                <main className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                            <Outlet />
                        </div>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
