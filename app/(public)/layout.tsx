// import { ZustandDebugger } from "./components/ZustandDebugger";

import "../globals.css";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';




export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (

        <div className="flex flex-col min-h-screen">   
          
          {/* // wakeup backend in render */}
          <Navbar  userRole={null} />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>



  );
}


// <ZustandDebugger />