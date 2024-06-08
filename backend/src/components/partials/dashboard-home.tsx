import { useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { NavigationMenuLink } from "@/components/ui/navigation-menu.tsx";
import { Home } from "lucide-react";

type Props = {
  isSelected: (arg0: boolean) => void
  active: boolean
}

export function DashboardHome(props: Props) {
  const [selected, setSelected] = useState<boolean>(false);

  const handleSelect = (value: boolean) => {
    setSelected(value);
    props.isSelected(value);
  }

  useEffect(() => {
    setSelected(props.active);
  }, [props.active])

  return(
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <NavigationMenuLink
            className={`flex items-center rounded-lg ${selected ? "text-white-foreground" : "text-muted-foreground"} transition-colors hover:text-foreground md:h-8 md:w-8 cursor-pointer`}
            onSelect={() => handleSelect(true)}>
            <Home className="h-5 w-5 sm:hidden md:flex" />
            <span className="sm:flex ml-5 md:hidden">Dashboard</span>
          </NavigationMenuLink>
        </TooltipTrigger>
        <TooltipContent side="right">Dashboard</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
