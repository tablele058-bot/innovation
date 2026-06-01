import Sidebar from "@/components/workspace/Sidebar";
import WorkspaceHeader from "@/components/workspace/WorkspaceHeader";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      <div className="flex-shrink-0">
        <WorkspaceHeader />
      </div>
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 flex">{children}</main>
      </div>
    </div>
  );
}
