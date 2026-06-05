import { redirect } from "next/navigation"

export default function LegacyInviteTokenPage({
  params,
}: {
  params: { token: string }
}) {
  redirect(`/invite/public/${encodeURIComponent(params.token)}`)
}