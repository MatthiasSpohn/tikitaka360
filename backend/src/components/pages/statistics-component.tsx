import { Table, TableBody, TableCaption, TableHead, TableHeader, TableRow } from "@/components/ui/table.tsx";
import { StatisticsRow } from "@/components/partials/statistics-row.tsx";
import { useEffect, useState } from "react";
import { ApplicationResult } from "@algorandfoundation/algokit-utils/types/indexer";
import { useQuery } from "@tanstack/react-query";
import algodClient from "@/lib/algodClient.ts";

type Props = {
  reload: number | undefined
}

export function StatisticsComponent(props: Props) {
  const creatorAddress = 'NBLA7YYTW7YYJ64A4UUQWM4YV57RXPLMZ53SCODDVZ4EDGZLVYD7AN5KAI';
  const [ createdApps, setCreatedApps] = useState<ApplicationResult[] | undefined>(undefined)

  const getAccountInfo = async () => {
    return await algodClient.accountInformation(creatorAddress).exclude('none').do();
  }

  const { data: accountInfo } = useQuery({
    queryKey: [],
    queryFn: getAccountInfo,
    enabled: !!creatorAddress,
  });

  useEffect(() => {
    if ( accountInfo ) {
      setCreatedApps(accountInfo['created-apps'])
    }
  }, [accountInfo])

  useEffect(() => {
    getAccountInfo().then((accountInfo) => {
      setCreatedApps(accountInfo['created-apps'])
    })
  }, [props.reload]);


  return(
    <Table>
      <TableCaption>
        <h2>Statistics</h2>
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>AppId</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Reviews</TableHead>
          <TableHead>Review Score</TableHead>
          <TableHead>Asset Price</TableHead>
          <TableHead>AssetID</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {createdApps && createdApps.map((app, index) => (
          <TableRow key={index}>
            <StatisticsRow appId={app.id} appGS={app.params['global-state']} />
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
