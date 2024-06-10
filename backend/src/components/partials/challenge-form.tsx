import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";

const formSchema = z.object({
  length: z.coerce.number().int().gte(0).lte(8),
  given: z.coerce.number().int().gte(0).lte(200),
  player: z.coerce.number().int().gte(1),
});

type Props = {
  playerId: number,
  onSubmit: (arg0: {
    length: number
    given: number
    player: number
  }) => void
}

export function ChallengeForm(props: Props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      length: 1,
      given: 100,
      player: props.playerId,
    }
  })

  // Submit handler.
  function onSubmit(data: z.infer<typeof formSchema>) {
    props.onSubmit(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-1.5 p-4 text-center">
        <div className="grid gap-2">
          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="length"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration of the challenge in days</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="given"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Potential between 0 and 200</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

          </div>
          <Button variant="secondary" type="submit" className="grid gap-4">Start Challenge</Button>
        </div>
      </form>
    </Form>
  );
}
