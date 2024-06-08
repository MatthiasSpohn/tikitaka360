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
import { LeaguePayload } from "@/interfaces/LeaguePayload.ts";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input"
import { PlusCircle } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form"
import { z } from "zod"

const formSchema = z.object({
  league_id: z.coerce.number().int(),
  league_name: z.string().min(2).max(55),
  country: z.string().min(2).max(55),
  logo: z.string().min(2).max(55),
  flag: z.string().min(2).max(55),
  season: z.coerce.number().int(),
});

type Props = {
  onSubmit: (arg0: LeaguePayload) => void,
}

export function LeagueFormSheet(props: Props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      league_id: 80,
      league_name: '3. Liga',
      country: 'Deutschland',
      logo: '/lilo/80_3_liga.png',
      flag: '/flags/deutschland.png',
      season: 2023
    }
  })
  // Submit handler.
  function onSubmit(data: z.infer<typeof formSchema>) {
    const payload: LeaguePayload = {
      league_id: data.league_id,
      league_name: data.league_name,
      country: data.country,
      logo: data.logo,
      flag: data.flag,
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
            Add League
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-scroll h-svh">
        <SheetHeader>
          <SheetTitle>League settings</SheetTitle>
          <SheetDescription>
            Please make sure that the league ID matches that of the API.
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
                      <FormLabel>ID</FormLabel>
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
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="league_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className="flex items-center justify-between mt-5">

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
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
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
              <FormField
                control={form.control}
                name="flag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Flag</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-2 pt-4">
              <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <SheetFooter>
                <SheetClose asChild>
                  <Button variant="secondary" type="submit">Save</Button>
                </SheetClose>
              </SheetFooter>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
