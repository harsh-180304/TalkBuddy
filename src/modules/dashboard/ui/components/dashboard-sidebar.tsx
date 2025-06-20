"use client"; //will be renderede on client window 

import{
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
}from "@/components/ui/sidebar";
import { BotIcon, StarIcon, VideoIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation"; 
import { DashboardUserButton } from "./dashboradUserButton";

const firstSection = [{
    icon : VideoIcon,
    label : "MyBuddy",
    href:"/Mybuddy"
},
{
    icon : BotIcon,
    label : "Agents",
    href:"/Agents"
},
];
const secondSection = [{
    icon : StarIcon,
    label: "Upgrade",
    href:"/Upgrade"
},
];

export const DashboardSidebar = () => {
    const pathname = usePathname(); 
    return(
        <Sidebar>
            <SidebarHeader className="text-sidebar-accent-foreground">
                <Link href = "/" className="flex items-center gap-2 px-2 pt-2">
                    <Image src = "/logo.svg" height={36} width={36} alt = "TalkBuddy"/>
                    <p className="text-2xl font-semibold">TalkBuddy</p>
                </Link>
            </SidebarHeader>
            <div className="px-4 py-2">
                <Separator className="opacity-50 text-[#4169E1]"/>
            </div>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {firstSection.map((item)=>(
                                <SidebarMenuItem key = {item.href}>
                                    <SidebarMenuButton 
                                        asChild
                                        className={cn(
                                        "h-10 hover:bg-linear-to-r/oklch border border-transparent hover:border-blue-500/10 from-sidebar-accent from-5% via-30% via-sidebar/50 to sidebar/50",
                                        pathname === item.href && "bg-linear-to-r/oklch border-blue-500/10"
                                         )}
                                        isActive = {pathname === item.href }
                                         >
                                        <Link href = {item.href}>
                                            <item.icon className="size-5"/>
                                            <span className="text-sm font-medium tracking-tight">{item.label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <div className="px-4 py-2">
                <Separator className="opacity-50 text-[#4169E1]"/>
                </div>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {secondSection.map((item)=>(
                                <SidebarMenuItem key = {item.href}>
                                    <SidebarMenuButton 
                                        asChild
                                        className={cn(
                                        "h-10 hover:bg-linear-to-r/oklch border border-transparent hover:border-blue-500/10 from-sidebar-accent from-5% via-30% via-sidebar/50 to sidebar/50",
                                        pathname === item.href && "bg-linear-to-r/oklch border-blue-500/10"
                                         )}
                                        isActive = {pathname === item.href }
                                         >
                                        <Link href = {item.href}>
                                            <item.icon className="size-5"/>
                                            <span className="text-sm font-medium tracking-tight">{item.label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="text-white">
                <DashboardUserButton/>
            </SidebarFooter>
        </Sidebar>
    )
};


