// import { ZustandDebugger } from "./components/ZustandDebugger";
import { DebugAuthStore } from '@/app/components/DebugAuthStore';
import WakeBackend from './components/WakeBackend';




export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">

      <body>
        <WakeBackend /> 
        <div className="flex flex-col min-h-screen">   
  
          <main className="flex-1">{children}</main>
        
        </div>

      {process.env.NODE_ENV === "development" && <DebugAuthStore />}
      </body>
    </html>

  );
}


// <ZustandDebugger />