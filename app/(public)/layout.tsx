// import { ZustandDebugger } from "./components/ZustandDebugger";

import "../globals.css";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WakeBackend from "../components/WakeBackend";



export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">

      <body>
        <div className="flex flex-col min-h-screen">   
          <WakeBackend /> 
          {/* // wakeup backend in render */}
          <Navbar  userRole={null} />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>

      </body>
    </html>

  );
}


// <ZustandDebugger />