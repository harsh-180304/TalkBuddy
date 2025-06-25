"use client";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { DataTable } from "../components/data-table";
import { useRouter } from "next/navigation";
import { columns } from "../components/columns";
import { EmptyState } from "@/components/empty-state";
import { useAgentsFilters } from "../../hooks/use-agents-filters";
import { DataPagination } from "../components/data-pagination";

export const AgentsView = ()=>{
    const router = useRouter();
    const [filters,setFilters] = useAgentsFilters();
    const trpc = useTRPC();
    const {data} = useSuspenseQuery(trpc.agents.getMany.queryOptions({
        ...filters,
    }));

    

    return (
        <div className="flexx 1 pb-1 px-4 md:px-8 flex flex-col gay-y-4"> 
            <DataTable data = {data.items} columns={columns} onRowClick={(row)=>router.push(`/Agents/${row.id}`)}/>
            <DataPagination                                     //this will give json info about agent on clicking on them
                page = {filters.page}
                totalPages = {data.totalPages}
                onPageChange = {(page)=>setFilters({page})}
            />
            {data.items.length === 0 && (
               <EmptyState
                    title="Create your first buddy"
                    description="Create an buddy that can talk to you via videocall.Each buddy will follow your instruction and can interact with you during the call."
               />
            )}
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