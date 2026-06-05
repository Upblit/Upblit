"use client"

import { useParams } from "next/navigation"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useEffect, useState } from "react"
import { apiGet } from "@/lib/api"
import type { Application } from "@/lib/types"
import { BrainIcon } from "lucide-react"

export function NavApplications() {
  const params = useParams<{ projectId?: string }>()
  const parsedProjectId = params.projectId ? Number(params.projectId) : Number.NaN
  const projectId = Number.isFinite(parsedProjectId) ? parsedProjectId : undefined
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (projectId === undefined) return
    const currentProjectId = projectId

    async function loadApplications() {
      setIsLoading(true)
      try {
        const data = await apiGet<Application[]>("/applications", { projectId: currentProjectId })
        setApplications(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error("Failed to load applications:", err)
        setApplications([])
      } finally {
        setIsLoading(false)
      }
    }

    void loadApplications()
  }, [projectId])

  if (projectId === undefined || applications.length === 0) return null

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Applications</SidebarGroupLabel>
      <SidebarMenu>
        {applications.map((app) => (
          <SidebarMenuItem key={app.id}>
            <SidebarMenuButton asChild>
              <a href={`/dashboard/${projectId}/${app.id}`} title={app.name}>
                <BrainIcon className="size-4" />
                <span className="truncate">{app.name}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
