// import { ZustandDebugger } from "./components/ZustandDebugger";
import { DebugAuthStore } from '@/app/components/DebugAuthStore';




export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">

      <body>
        <div className="flex flex-col min-h-screen">   
  
          <main className="flex-1">{children}</main>
        
        </div>

      {process.env.NODE_ENV === "development" && <DebugAuthStore />}
      </body>
    </html>

  );
}


// <ZustandDebugger />