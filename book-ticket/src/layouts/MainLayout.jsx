import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* Footer Placeholder */}
      <footer className="border-t border-border py-6 md:py-0">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row px-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Khaleeji Tour. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
