import { db } from "@/db";
import { meetings } from "@/db/schema";
import { createTRPCRouter,protectedProcedure } from "@/trpc/init";
import { Auth } from "better-auth";
//import { agentsInsertSchema, agentsUpdateSchema } from "../schemas";
import {z} from "zod";
import { eq , getTableColumns, and, ilike ,desc, count} from "drizzle-orm";
import { DEFAULT_PAGE, MAX_PAGE_SIZE, MIN_PAGE_SIZE ,DEFAULT_PAGE_SIZE} from "@/constants";
import { pages } from "next/dist/build/templates/app-page";
import { TRPCError } from "@trpc/server";

export const meetingRouter = createTRPCRouter({
   
    getOne: protectedProcedure.input(z.object({id : z.string()}))
        .query( async ({ input,ctx })=>{ //for updating the agent they hav to fetch first and this done by getOne
        const[existingMeeting] = await db           //agents on the basis of id
            .select({
                //agent associated with number of meeings.
                ...getTableColumns(meetings),
                //change it later
    })
            .from(meetings)
            .where(
                and(
                    eq(meetings.id , input.id),
                    eq(meetings.userId , ctx.auth.user.id), //along side grasping the data we check that author is the creater of that agent or not 

            )
        );
        if(!existingMeeting){
            throw new TRPCError({code:"NOT_FOUND",message : "Agent not found" })     
        }
    
        return existingMeeting ;
    }),
    getMany : protectedProcedure
      .input(
        z.object({
           page : z.number().default(DEFAULT_PAGE),
           pageSize:z   
            .number()
            .min(MIN_PAGE_SIZE)
            .max(MAX_PAGE_SIZE)
            .default(DEFAULT_PAGE_SIZE),
        search:z.string().nullish()
         })
        )
          //whenever we create new agent we refetch agent getMany by invalidating it.
         //thus we put default value and put the whole object in optional
    
        .query(async({ctx,input})=>{
          const {search,page,pageSize} = input;
          const data = await db
            .select({
                ...getTableColumns(meetings),
            })
            .from(meetings)
            .where(
                and(
                    eq(meetings.userId , ctx.auth.user.id),
                    search ? ilike(meetings.name,`%${search}%`) : undefined,
                )
            )
            .orderBy(desc(meetings.createdAt),desc(meetings.id))
            .limit(pageSize)
            .offset((page-1)*pageSize)
        
        const [total] = await db  
            .select({count:count()})
            .from(meetings)
            .where(
                and(
                    eq(meetings.userId , ctx.auth.user.id),
                    search ? ilike(meetings.name,`%${search}%`) : undefined,
                )
            );
        const totalPages = Math.ceil(total.count / pageSize)
        return {
            items:data,
            total:total.count,
            totalPages,
        }
    

    }),
    
    
});