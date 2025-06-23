"use client";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { useQuery,useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ResponsiveDialog } from "@/components/responsive-dialog";
export const AgentsView = ()=>{
    const trpc = useTRPC();
    const {data} = useSuspenseQuery(trpc.agents.getMany.queryOptions());

    return (
        <div>
            {JSON.stringify(data , null ,2)}
        </div>
    )
}

export const AgentViewError = () => {
    return (
        <ErrorState
        title = "Error Loading Agents"
        description="Something went wrong"
    />        
    )
}