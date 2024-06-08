export interface NavItem {
    title: string
    href?: string
    disabled?: boolean
    external?: boolean
    label?: string
}

export interface MainNavItem extends NavItem {}

export interface NavItemWithChildren extends NavItem {
    items: NavItemWithChildren[]
}

export interface SidebarNavItem extends NavItemWithChildren {}
interface DocsConfig {
    mainNav: MainNavItem[]
    sidebarNav: SidebarNavItem[]
}

export const docsConfig: DocsConfig = {
    mainNav: [
        {
            title: 'About',
            href: '/about',
        },
        {
            title: 'Account',
            href: '/account',
        },
        {
            title: 'App',
            href: '/',
        },
    ],
    sidebarNav: [],
}
