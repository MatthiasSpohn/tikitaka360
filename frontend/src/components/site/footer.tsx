export function SiteFooter() {
    return (
        <footer className="py-6 md:px-8 md:py-0">
            <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
                <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
                    <span></span>
                </p>
                <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
                    {1>5 && <a href="/imprint" className="font-medium underline underline-offset-4 mr-3">Imprint</a>}
                    {1>5 && <a href="/privacy-policy" className="font-medium underline underline-offset-4">Privacy policy</a>}
                </p>
            </div>
        </footer>
    );
}
