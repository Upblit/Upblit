"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { NavApplications } from "@/components/nav-applications"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { BotIcon, BookOpenIcon, Settings2Icon, FrameIcon, PieChartIcon, MapIcon } from "lucide-react"
import { useUserData } from "@/hooks/use-userData";
import { useOrg } from "@/hooks/use-org";
import { useProjects } from "@/hooks/use-projects";
import { apiGet } from "@/lib/api";



const baseNavMain = [
    {
      title: "Projects",
      url: "/dashboard",
      icon: <FrameIcon />,
      isActive: true,
    },
    {
      title: "Teams",
      url: "/teams",
      icon: <MapIcon />,
    },
    {
      title: "Global Alerts",
      url: "/alerts",
      icon: <PieChartIcon />,
    },
    {
      title: "Integrations",
      url: "/docs",
      icon: <BookOpenIcon />,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: <Settings2Icon />,
      items: [
        {
          title: "General",
          url: "/settings/general",
        },
        {
          title: "Usage & Limits",
          url: "/settings/limits",
        },
      ],
    },
  ]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const userdata = useUserData((state) => state.user);
  const { orgs, activeOrgId, setOrgs, setActiveOrgId, hydrateActiveOrgId, hasHydratedActiveOrgId } = useOrg();
  const projectsByOrg = useProjects((state) => state.projects);
  const setProjects = useProjects((state) => state.setProjects);

  React.useEffect(() => {
    hydrateActiveOrgId()
  }, [hydrateActiveOrgId])

  React.useEffect(() => {
    let cancelled = false

    const loadOrgs = async () => {
      try {
        const data = await apiGet<any[]>('/org')
        if (cancelled) return
        const nextOrgs = Array.isArray(data) ? data : []
        setOrgs(nextOrgs)

        // If the user has no organizations, clear any stored active org id
        if (nextOrgs.length === 0) {
          setActiveOrgId(null)
        } else {
          const activeExists = activeOrgId ? nextOrgs.some((org) => org.id === activeOrgId) : false
          if (hasHydratedActiveOrgId && (!activeOrgId || !activeExists)) {
            setActiveOrgId(nextOrgs[0].id)
          }
        }
      } catch (err) {
        console.error('Failed to load organizations', err)
      }
    }

    loadOrgs()

    return () => {
      cancelled = true
    }
  }, [activeOrgId, hasHydratedActiveOrgId, setActiveOrgId, setOrgs])

  React.useEffect(() => {
    if (!activeOrgId) return

    let cancelled = false

    const loadProjects = async () => {
      try {
        const data = await apiGet<any[]>(`/project`, { OrganizationId: activeOrgId })
        if (cancelled) return
        setProjects(activeOrgId, Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Failed to load projects', err)
        if (!cancelled) {
          setProjects(activeOrgId, [])
        }
      }
    }

    loadProjects()

    return () => {
      cancelled = true
    }
  }, [activeOrgId, setProjects])

  const projects = activeOrgId ? projectsByOrg[activeOrgId] || [] : [];
  // Temporarily disable AI Docs in the sidebar
  // const aiDocsUrl = projects[0]?.id ? `/dashboard/${projects[0].id}/ai` : "/dashboard";
  // const navMain = [
  //   ...baseNavMain.slice(0, 1),
  //   {
  //     title: "AI Docs",
  //     url: aiDocsUrl,
  //     icon: <BotIcon />,
  //   },
  //   ...baseNavMain.slice(1),
  // ];
  const navMain = baseNavMain;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={orgs} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavApplications />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{
          name: userdata?.username ?? "Guest User",
          email: userdata?.email ?? "guest@example.com",
          avatar: userdata?.avatar ?? "/logo.png",
        }} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
