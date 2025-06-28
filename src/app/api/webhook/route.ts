import {
    CallEndedEvent,
    CallTranscriptionReadyEvent,
    CallSessionParticipantLeftEvent,
    CallRecordingReadyEvent,
    CallSessionStartedEvent,
} from "@stream-io/node-sdk"

import { and,eq,not } from "drizzle-orm"
import { db } from "@/db"
import { agents, meetings } from "@/db/schema"

import { streamVideo } from "@/lib/stream-video"
import { SigmaSquare } from "lucide-react"
import { NextRequest, NextResponse } from "next/server"


function verifySignatureWithSDK (body: string , signature : string) :boolean{
    return streamVideo.verifyWebhook(body,signature);
}

export async function POST(req : NextRequest){
    const signature = req.headers.get("x-signature");
    const apikey = req.headers.get("x-api-key");

    if(!signature || !apikey){
        return NextResponse.json(
            {error : "Missing signature or API key"},
            {status : 400}
        ); 
    }

    const body = await req.text();

    if(!verifySignatureWithSDK(body,signature)){
        return NextResponse.json({error : "Invalid signature"},{status : 401});
    }

    let payload : unknown;
    try {
        payload = JSON.parse(body) as Record <string,unknown>;
    }catch {
        return NextResponse.json({error : "Invalid JSON"},{status:400})
    }

    const eventType = (payload as Record <string,unknown>)?.type;

    if(eventType === "call.session_started"){
        const event = payload as CallSessionStartedEvent;
        const meetingId = event.call.custom?.meetingId; //the custom from server procedure is helping in using meetingId even if we are in a webhook

        if(!meetingId) {
            return NextResponse.json({error : "Missing meetingId"},{status:400});
        }

        const [existingMeeting] = await db   
        .select()
        .from(meetings)
        .where(
            and(
                eq(meetings.id , meetingId),
                not(eq(meetings.status , "completed")),
                not(eq(meetings.status , "active")),
                not(eq(meetings.status , "cancelled")),
                not(eq(meetings.status , "processing")),
            )
        );

        if(!existingMeeting){
            return NextResponse.json({error : "Meeting not found"},{status : 400});
        }

        await db
            .update(meetings)
            .set({
                status : "active", //immediatly convert to active so multiple agents cannot undergo in active state.
                startedAt:new Date(),
            })
            .where(eq(meetings.id , meetingId))

        const [existingAgent] = await db    
            .select()
            .from(agents)
            .where(eq(agents.id , existingMeeting.agentId))

            if(!existingAgent){
                return NextResponse.json({error : "Agent not found"},{status:400});
            }

            const call = streamVideo.video.call("default" , meetingId);

            const realTimeClient = await streamVideo.video.connectOpenAi({
                call,
                openAiApiKey : process.env.OPENAI_API_KEY!,
                agentUserId : existingAgent.id,
            });

            realTimeClient.updateSession({
                instructions : existingAgent.instruction,
            });
    }
        else if(eventType === "call.session_paticipant_left"){
            const event = payload as CallSessionParticipantLeftEvent;
            const meetingId = event.call_cid.split(":")[1]; //no call id is availabe in event thus we have to access it in this way  //call_cid is formated as "type:id"

            if(!meetingId){
                return NextResponse.json({error : "Missing meetingId"},{status : 400}); 
            }

            const call = streamVideo.video.call("default" , meetingId);
            await call.end();
    }  

    
    return NextResponse.json({status : "ok"});
}