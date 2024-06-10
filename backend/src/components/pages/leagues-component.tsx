import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.tsx";
import { LeagueFormSheet } from "@/components/partials/league-form-sheet.tsx";
import { LeaguePayload } from "@/interfaces/LeaguePayload.ts";
import axios from "axios";
import { axiosHeaders, baseURL } from "@/utils/common-axios.ts";
import { useEffect, useState } from "react";

export function LeaguesComponent() {
  const [leagues, setLeagues] = useState<LeaguePayload[]>([]);

  const headers = axiosHeaders;
  const baseUrl = baseURL;

  useEffect(() => {
    axios.get(`${baseUrl}/league`, { headers })
      .then((res) => {
        if (res.status === 200 && res.data) {
          if (!res.data.status) {
            console.log(res.data.error.message);
          } else {
            const response_data: LeaguePayload[] = res.data.data;
            setLeagues(response_data)
          }
        }
      })
      .catch(error => {
        console.log(error.message);
      });
  },[baseUrl, headers])

  const submit = (val: LeaguePayload) => {
    const _leagues = leagues;
    axios.post(`${baseUrl}/league`, val, {headers})
      .then((res) => {
        if (res.status === 200 && res.data) {
          if (!res.data.status) {
            console.log(res.data.error.message);
          } else {
            const response_data: LeaguePayload = res.data.data;
            _leagues.push(response_data)
            setLeagues(_leagues)
          }
        }
      })
      .catch(error => {
        console.log(error.message);
      });
  }

  return(
    <div className="h-full py-6">
      <LeagueFormSheet onSubmit={submit}/>
      <Table>
        <TableCaption>
          <h2>Leagues</h2>
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="hidden md:table-cell">ID</TableHead>
            <TableHead className="hidden w-[100px] sm:table-cell">
              <span className="sr-only">Logo</span>
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Country</TableHead>
            <TableHead className="hidden md:table-cell">Flag</TableHead>
            <TableHead>Season</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leagues.map((lp, index) => (
          <TableRow key={index}>
            <TableCell className="hidden sm:table-cell font-medium">
              {lp.league_id}
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              <img
                alt={lp.league_name}
                title={lp.league_name}
                className="aspect-square rounded-md object-cover"
                height="64"
                src={lp.logo}
                width="64"
              />
            </TableCell>
            <TableCell className="font-medium">
              {lp.league_name}
            </TableCell>
            <TableCell className="font-medium">
              {lp.country}
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              <img
                alt="Country Flag"
                className="aspect-square rounded-md object-cover"
                height="64"
                src={lp.flag}
                width="64"
              />
            </TableCell>
            <TableCell className="font-medium">
              {lp.season} / {lp.season + 1}
            </TableCell>
            <TableCell className="font-medium">
              <a href={`/dashboard/teams/${lp.season}/${lp.league_id}`}>Select Teams</a>
            </TableCell>
          </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
