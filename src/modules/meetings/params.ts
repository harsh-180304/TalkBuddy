import { DEFAULT_PAGE } from "@/constants";
import {parseAsInteger , parseAsString, createLoader , parseAsStringEnum } from "nuqs/server";
import { MeetingStatus } from "./types";
export const filterSearchParams = {
    search : parseAsString.withDefault("").withOptions({clearOnDefault: true}), 
    page : parseAsInteger.withDefault(DEFAULT_PAGE).withOptions({clearOnDefault : true}),
    status : parseAsStringEnum(Object.values(MeetingStatus)),
    agentId : parseAsString.withDefault("").withOptions({clearOnDefault: true}),  
};

export const loadSearchParams = createLoader(filterSearchParams);//repeating twice one for server and one for client