"use client"

import { usePathname } from "next/navigation"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronRightIcon } from "lucide-react"
import Link from "next/link"

type NavItem = {
  title: string
  url: string
  icon?: React.ReactNode
  items?: {
    title: string
    url: string
  }[]
}

export function NavMain({
  items,
}: {
  items: NavItem[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider mb-2 px-2">
        Platform
      </SidebarGroupLabel>
      <SidebarMenu className="gap-1.5">
        {items.map((item) => {
          // A bit naive but works for the current URLs
          const isActive = pathname === item.url || (item.url !== "/" && pathname?.startsWith(item.url))

          if (item.items?.length) {
            return (
              <Collapsible key={item.title} asChild defaultOpen={isActive} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.title}
                      className={`
                        transition-all duration-200 ease-in-out h-10 px-3 rounded-lg
                        ${isActive
                              ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-sm ring-1 ring-sidebar-border"
                              : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"}
                      `}
                    >
                      <div className={`flex items-center justify-center ${isActive ? "text-[#087f9c]" : "opacity-80"}`}>
                        {item.icon}
                      </div>
                      <span>{item.title}</span>
                      <ChevronRightIcon className="ms-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="mt-1">
                      {item.items.map((subItem) => {
                        const isSubActive = pathname === subItem.url
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild isActive={isSubActive}>
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )
          }

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                className={`
                  transition-all duration-200 ease-in-out h-10 px-3 rounded-lg
                  ${isActive 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-sm ring-1 ring-sidebar-border" 
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"}
                `}
              >
                <Link href={item.url} className="flex items-center gap-3">
                  <div className={`flex items-center justify-center ${isActive ? "text-[#087f9c]" : "opacity-80"}`}>
                    {item.icon}
                  </div>
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
