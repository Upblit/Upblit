import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { Banner, Head, Search } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import { SiteNav } from "@/components/marketing/site-nav";
import {SiteFooter} from "@/components/marketing/site-footer";
import "nextra-theme-docs/style.css";

export const metadata = {
  title: "Upblit Docs",
  description: "Upblit documentation — Deploy. Observe. Scale.",
};


const search = <Search placeholder="Search docs..." />;
const pageMap = await getPageMap('/docs');

export default async function DocsLayout({
  children = null,
}: {
  children?: React.ReactNode;
}) {
  return (
    <Layout
      navbar={<SiteNav />}
      pageMap={pageMap}
      docsRepositoryBase="https://github.com/upblit"
      footer={<SiteFooter />}
      search={search}
      editLink={null}
      feedback={{ content: null }}
    >
      {children ?? null}
    </Layout>
  );
}