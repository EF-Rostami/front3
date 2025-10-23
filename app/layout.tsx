// import { ZustandDebugger } from "./components/ZustandDebugger";
import { DebugAuthStore } from '@/app/components/DebugAuthStore';
import "./globals.css";
import Navbar from './components/Navbar';
import Footer from './components/Footer';


export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">

      <body>
        <div className="flex flex-col min-h-screen">   
          <Navbar  userRole={null} />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>

      {process.env.NODE_ENV === "development" && <DebugAuthStore />}
      </body>
    </html>

  );
}


// <ZustandDebugger />