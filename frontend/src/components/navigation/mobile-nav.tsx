import * as React from 'react'
import { cn } from '@/lib/utils'
import { Icons } from '@/components/site/icons'
import { Button } from '@/components/ui/button'
import {Sheet, SheetContent, SheetTrigger} from '@/components/ui/sheet'
import { Link } from 'react-router-dom'
import type { LinkProps } from 'react-router-dom'
import {docsConfig} from "@/config/docs.ts";

export function MobileNav() {
    const [open, setOpen] = React.useState(false)
    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden flex content-end">
                <Button className="bg-slate-950 hover:bg-slate-900 border border-slate-700 navbar-burger flex items-center p-3">
                    <svg className="block h-4 w-4 stroke-slate-950 fill-slate-300" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <title>Mobile Menu</title>
                        <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"></path>
                    </svg>
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-gray-950 pr-0">
                <Icons.tikitaka className="h-6 w-auto mb-8"/>
                <div className="flex flex-col space-y-5">
                    {docsConfig.mainNav?.map(
                        (item) =>
                            item.href && (
                                <MobileLink key={item.href} to={item.href}>
                                    {item.title}
                                </MobileLink>
                            ),
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}

function MobileLink({ children, to, className, ...props }: LinkProps) {
    return (
        <Link to={to} className={cn(className)} {...props}>
            {children}
        </Link>
    )
}
