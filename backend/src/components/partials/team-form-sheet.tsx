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
import { TeamImportPayload } from "@/interfaces/LeaguePayload.ts";

const formSchema = z.object({
  league_id: z.coerce.number().int(),
  season: z.coerce.number().int(),
});

type Props = {
  onSubmit: (arg0: TeamImportPayload) => void,
}

export function TeamFormSheet(props: Props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      league_id: 140,
      season: 2023
    }
  })
  // Submit handler.
  function onSubmit(data: z.infer<typeof formSchema>) {
    const payload: TeamImportPayload = {
      league_id: data.league_id,
      season: data.season
    }
    props.onSubmit(payload)
  }

  return(
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <PlusCircle className="h-3.5 w-3.5 mr-3" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Import Teams
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-scroll h-svh">
        <SheetHeader>
          <SheetTitle>League settings for the team</SheetTitle>
          <SheetDescription>
            Set league and season for the teams you want to import.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex items-center justify-between mt-5">
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="league_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>League ID</FormLabel>
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
