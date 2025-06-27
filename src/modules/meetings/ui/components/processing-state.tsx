import { EmptyState } from "@/components/empty-state"

 export const ProcessingState = () => {
    return (
        <div className="bg-white rouded-lg px-4 py-5 flex flex-col gap-y-8 items-center justify-center ">   
            <EmptyState
                image="/processing.svg"
                title="Meeting completed"
                description="This Meeting was completed, a summay will appear soon"
            />
        </div>
    )
 }
