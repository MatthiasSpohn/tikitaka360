import {
  Sheet,
  SheetTrigger,
  SheetHeader,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet.tsx";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input"
import { PlusCircle } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form"
import { z } from "zod"
import { PlayerImportPayload } from "@/interfaces/LeaguePayload.ts";

const formSchema = z.object({
  team_id: z.coerce.number().int(),
  season: z.coerce.number().int(),
});

type Props = {
  onSubmit: (arg0: PlayerImportPayload) => void,
}

export function PlayerFormSheet(props: Props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      team_id: 177,
      season: 2023
    }
  })
  // Submit handler.
  function onSubmit(data: z.infer<typeof formSchema>) {
    const payload: PlayerImportPayload = {
      team_id: data.team_id,
      season: data.season
    }
    console.log(payload)
    props.onSubmit(payload)
  }

  return(
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <PlusCircle className="h-3.5 w-3.5 mr-3" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Import Players
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-scroll h-svh">
        <SheetHeader>
          <SheetTitle>Team settings for the players</SheetTitle>
          <SheetDescription>
            Set team and season for the players you want to import.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex items-center justify-between mt-5">
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="team_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team ID</FormLabel>
                      <FormControl>
                        <Input
                          className="w-20"
                          type="number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="season"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Season</FormLabel>
                      <FormControl>
                        <Input
                          className="w-20"
                          type="number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className="grid gap-2 pt-4">
              <SheetFooter>
                <SheetClose asChild>
                  <Button variant="secondary" type="submit">Import</Button>
                </SheetClose>
              </SheetFooter>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
