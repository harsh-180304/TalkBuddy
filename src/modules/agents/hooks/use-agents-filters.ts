import { DEFAULT_PAGE } from "@/constants";
import {parseAsInteger , parseAsString , useQueryStates } from "nuqs";

export const useAgentsFilters = () => {
    return useQueryStates({
        search : parseAsString.withDefault("").withOptions({clearOnDefault: true}), //with defalut and clear default our for increasing user exp. if search is " " this will not be displayed on our main url.
        page : parseAsInteger.withDefault(DEFAULT_PAGE).withOptions({clearOnDefault : true}),
})
};

//we are using nuqs to sync our url with react state
//localhost:3000?search=hello <===> useState()
//and this will not allow the user to break our app by changing the url as PAGE_SIZE = 100000000.