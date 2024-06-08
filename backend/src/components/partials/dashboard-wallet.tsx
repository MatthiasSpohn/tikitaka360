import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { Wallet } from "lucide-react";

export function DashboardWallet() {
  return(
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <a
            href="#"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <Wallet className="h-5 w-5" />
            <span className="sr-only">Wallet Connect</span>
          </a>
        </TooltipTrigger>
        <TooltipContent side="right">Wallet Connect</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
