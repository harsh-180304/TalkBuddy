import { useState } from "react";
import { format } from "date-fns";
import { SearchIcon } from "lucide-react";
import Highlighter from "react-highlight-words";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { Input } from "@/components/ui/input";
import { generateAvatarUri } from "@/lib/avatar";

interface Props {
  meetingId: string;
}

export const Transcript = ({ meetingId }: Props) => {
  const trpc = useTRPC();
  const { data, isLoading, error } = useQuery(
    trpc.meetings.getTranscript.queryOptions({ id: meetingId })
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Debug logging
  console.log("Transcript Debug:", {
    meetingId,
    data,
    isLoading,
    error,
    dataLength: data?.length,
    dataItems: data?.map((item, i) => ({ index: i, item, isNull: item === null })),
  });

  // Filter out null items and then apply search filter
  const validData = (data ?? []).filter((item) => item !== null && item !== undefined);
  
  console.log("Valid data after filtering nulls:", validData);

  const filteredData = validData.filter((item) =>
    item?.text?.toString().toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border px-4 py-5 flex flex-col gap-y-4 w-full">
        <p className="text-sm font-medium">Transcript</p>
        <div className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Loading transcript...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-white rounded-lg border px-4 py-5 flex flex-col gap-y-4 w-full">
        <p className="text-sm font-medium">Transcript</p>
        <div className="flex items-center justify-center py-8">
          <p className="text-red-500">Error loading transcript: {error.message}</p>
        </div>
      </div>
    );
  }

  // Show empty state - check for null items
  if (!data || data.length === 0 || validData.length === 0) {
    const hasNullItems = data && data.length > 0 && validData.length === 0;
    return (
      <div className="bg-white rounded-lg border px-4 py-5 flex flex-col gap-y-4 w-full">
        <p className="text-sm font-medium">Transcript</p>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-muted-foreground">
              {hasNullItems 
                ? `Found ${data.length} transcript entries, but all are empty/null`
                : "No transcript available"
              }
            </p>
            {hasNullItems && (
              <p className="text-sm text-orange-600 mt-2">
                This might indicate a data processing issue on the server
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border px-4 py-5 flex flex-col gap-y-4 w-full">
      <p className="text-sm font-medium">
        Transcript ({validData.length} valid items out of {data.length} total)
      </p>
      
      <div className="relative">
        <Input
          placeholder="Search Transcript"
          className="pl-7 h-9 w-[240px]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      </div>
      
      {filteredData.length === 0 && searchQuery ? (
        <div className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
        </div>
      ) : (
        <ScrollArea className="h-[600px]">
          <div className="flex flex-col gap-y-4">
            {filteredData.map((item, index) => {
              console.log("Rendering item:", item); // Debug each item
              
              return (
                <div
                  key={item?.start_ts || index}
                  className="flex flex-col gap-y-2 hover:bg-muted p-4 rounded-md border"
                >
                  <div className="flex gap-x-2 items-center">
                    <Avatar className="size-6">
                      <AvatarImage
                        src={
                          item?.user?.image ?? 
                          generateAvatarUri({ 
                            seed: item?.user?.name ?? "Anonymous", 
                            variant: "initials" 
                          })
                        }
                        alt="User Avatar"
                      />
                    </Avatar>
                    <p className="text-sm font-medium">
                      {item?.user?.name ?? "Anonymous"}
                    </p>
                    <p className="text-sm text-blue-500 font-medium">
                      {item?.start_ts 
                        ? format(new Date(0, 0, 0, 0, 0, 0, item.start_ts), "mm:ss")
                        : "00:00"
                      }
                    </p>
                  </div>
                  <Highlighter
                    className="text-sm text-neutral-700"
                    highlightClassName="bg-yellow-200"
                    searchWords={searchQuery ? [searchQuery] : []}
                    autoEscape={true}
                    textToHighlight={item?.text ?? "No text available"}
                  />
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};