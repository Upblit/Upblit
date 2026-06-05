"use client"

import React from "react";
import { apiGet } from "@/lib/api";
import { useEffect, useState } from "react";
import { useUserData } from "@/hooks/use-userData"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import Link from "next/link"
import { Button } from "@/components/ui/button"

type Invoice = {
  id: number;
  userId: number;
  plan: string;
  amount: number;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
  storageUrl?: string;
};

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const userId = useUserData.getState().user?.id
        if (!userId) {
          setInvoices([])
          return
        }
        const data = await apiGet<Invoice[]>(`/user/billing/${userId}`);
        if (mounted) setInvoices(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load invoices', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, []);

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/[0.05]">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ms-1" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink asChild>
                  <Link href="/account" className="text-muted-foreground/60 hover:text-foreground">Account</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block opacity-40" />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium text-foreground/90">Billing</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 p-8 pt-10">
        <section className="rounded-2xl border border-white/[0.08] bg-[#111111] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
          <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Account</p>
              <h1 className="mt-2 text-2xl font-semibold text-white">Billing</h1>
              <p className="mt-2 text-sm text-muted-foreground">Invoices and billing history for your account.</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading invoices…</p>
            ) : invoices.length === 0 ? (
              <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-6 text-sm text-muted-foreground">No invoices yet.</div>
            ) : (
              <div className="grid gap-4">
                {invoices.map((inv) => (
                  <div key={inv.id} className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">Invoice #{inv.id}</div>
                      <div className="text-sm text-muted-foreground">{inv.plan} • ${inv.amount.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">{new Date(inv.periodStart).toLocaleDateString()} — {new Date(inv.periodEnd).toLocaleDateString()}</div>
                    </div>
                    <div>
                      {inv.storageUrl ? (
                        <Button asChild size="sm">
                          <a href={inv.storageUrl} target="_blank" rel="noreferrer">Download PDF</a>
                        </Button>
                      ) : (
                        <span className="text-sm text-muted-foreground">No file</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  )
}
