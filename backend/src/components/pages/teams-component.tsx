import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.tsx";
import { TeamPayload } from "@/interfaces/TeamPayload.ts";
import { useLoaderData } from 'react-router-dom';

import axios, { AxiosResponse } from "axios";
import { axiosHeaders, baseURL } from "@/utils/common-axios.ts";
import { useEffect, useState } from "react";
import { TeamFormSheet } from "@/components/partials/team-form-sheet.tsx";
import { TeamImportPayload } from "@/interfaces/LeaguePayload.ts";

export function TeamsComponent() {
  const [teams, setTeams] = useState<TeamPayload[]>([]);
  const season: number = 2023;

  const headers = axiosHeaders;
  const baseUrl: string = baseURL;
  const resData = useLoaderData() as AxiosResponse;

  useEffect(() => {
    if (resData.status === 200 && resData.data) {
      if (!resData.data.status) {
        console.log(resData.data.error.message);
      } else {
        const response_data: TeamPayload[] = resData.data.data;
        setTeams(response_data)
      }
    }
  },[resData])

  const handleImport = (payload: TeamImportPayload) => {
    axios.post(`${baseUrl}/team`, payload, {headers})
      .then((res) => {
        if (res.status === 200 && res.data) {
          if (!res.data.status) {
            console.log(res.data.error.message);
          } else {
            const response_data: TeamPayload[] = res.data.data;
            setTeams(response_data)
          }
        }
      })
      .catch(error => {
        console.log(error.message);
      });
  }

  return(
    <div className="h-full py-6">
      <TeamFormSheet onSubmit={handleImport} />
      <Table>
        <TableCaption>
          <h2>Teams</h2>
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="hidden md:table-cell">ID</TableHead>
            <TableHead className="hidden w-[100px] sm:table-cell">
              <span className="sr-only">Logo</span>
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead className="hidden md:table-cell">Country</TableHead>
            <TableHead>Founded</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((tp, index) => (
            <TableRow key={index}>
              <TableCell className="hidden sm:table-cell font-medium">
                {tp.team_id}
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <img
                  alt={tp.team_name}
                  title={tp.team_name}
                  className="aspect-square rounded-md object-cover"
                  height="64"
                  src={tp.logo}
                  width="64"
                />
              </TableCell>
              <TableCell className="font-medium">
                {tp.team_name}
              </TableCell>
              <TableCell className="font-medium">
                {tp.code}
              </TableCell>
              <TableCell className="hidden sm:table-cell font-medium">
                {tp.country}
              </TableCell>
              <TableCell className="font-medium">
                {tp.founded}
              </TableCell>
              <TableCell className="font-medium">
                <a href={`/dashboard/players/${season}/${tp.team_id}`}>Select Team</a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
