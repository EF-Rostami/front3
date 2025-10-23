



export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
    {/* <AuthInitializer /> */}

      <main className="flex-1">{children}</main>
 
    </div>
  );
}