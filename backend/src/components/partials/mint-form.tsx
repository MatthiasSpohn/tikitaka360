import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form"
import { z } from "zod"
import { MintPayload, PlayerPayload } from "@/interfaces/LeaguePayload.ts";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { useEffect, useState } from "react";
import { axiosHeaders, baseURL } from "@/utils/common-axios.ts";
import { Button } from "@/components/ui/button.tsx";

const formSchema = z.object({
  asa_name: z.string().min(2).max(55),
  unit_name: z.string().min(2).max(55),
  total_supply: z.coerce.number().int().gte(1).lte(1000),
  decimals: z.coerce.number().int().gte(0).lte(6),
  image: z.string().min(2).max(55),
  description: z.string().min(0).max(55),
  external_url: z.string().min(0).max(55),
});

type Props = {
  playerId: number,
  onSubmit: (arg0: {
    data: never;
    status: boolean;
  }) => void
}

export function MintForm(props: Props) {
  const [playerData, setPlayerData] = useState<PlayerPayload|undefined>(undefined)
  const headers = axiosHeaders;
  const baseUrl = baseURL;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      asa_name: '',
      unit_name: '',
      total_supply: 1000,
      decimals: 0,
      image: '',
      description: 'TikiTaka 360° Player NFT (ARC-19)',
      external_url: 'https://app.tikitaka360.com/',
    }
  })

  useEffect(() => {
    axios.get(`${baseUrl}/player/${props.playerId}`, { headers })
      .then((res) => {
        if (res.status === 200 && res.data) {
          if (!res.data.status) {
            console.log(res.data.error.message);
          } else {
            const playerPayload: PlayerPayload = res.data.data;
            setPlayerData(playerPayload);
            form.setValue('asa_name', `TikiTaka ${playerPayload.player_id}`)
            form.setValue('unit_name', `T${playerPayload.player_id}`)
            form.setValue('image', playerPayload.photo)
          }
        }
      })
      .catch(error => {
        console.log(error.message);
      });
  },[baseUrl, form, headers, props.playerId])

  // Submit handler.
  function onSubmit(data: z.infer<typeof formSchema>) {
    if (!playerData || !playerData.statistics || playerData.statistics.length < 1) {
      console.log('No player payload found');
      return;
    }
    const payload: MintPayload = {
      name: data.asa_name,
      unit_name: data.unit_name,
      total_supply: data.total_supply,
      decimals: data.decimals,
      image: data.image,
      description: data.description,
      external_url: data.external_url,
      properties: {
        player_id: playerData.player_id,
        season: playerData.statistics[0].season ?? new Date().getFullYear(),
        team_id: playerData.statistics[0].team_id ?? 0,
        league_id: playerData.statistics[0].league_id ?? 0,
        firstname: playerData.firstname,
        lastname: playerData.lastname,
        birthdate: playerData.birthdate ?? 'n.a.',
        nationality: playerData.nationality ?? 'n.a.',
        number: playerData.statistics[0].number ?? 0,
        position: playerData.statistics[0].position ?? 'n.a.',
      },
    }
    axios.patch(`${baseUrl}/player/${props.playerId}`, payload,{ headers })
      .then((res) => {
        if (res.status === 200 && res.data) {
            props.onSubmit(res.data);
        }
      })
      .catch(error => {
        console.log(error.message);
      });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-1.5 p-4 text-center">
        <div className="grid gap-2">
          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="total_supply"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total supply</FormLabel>
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
          <Button variant="secondary" type="submit" className="grid gap-4">Mint</Button>
        </div>
      </form>
    </Form>
  );
}
