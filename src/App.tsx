import { usePathname } from './routes/router';
import LandingPage from './pages/LandingPage';
import GalleryApp from './pages/GalleryApp';
import DirectoryPage from './pages/DirectoryPage';
import GalleryRoute from './pages/GalleryRoute';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  const pathname = usePathname();
  const parts = pathname.split('/').filter(Boolean);

  // Kept as a fixed demo route showing this site's own original gallery.
  if (pathname === '/gallery') return <GalleryApp />;
  if (pathname === '/landing') return <LandingPage />;

  if (parts[0] === 'g' && parts[1]) return <GalleryRoute slug={parts[1]} />;
  if (parts[0] === 'login') return <LoginPage />;
  if (parts[0] === 'signup') return <SignupPage />;
  if (parts[0] === 'dashboard') return <DashboardPage />;

  return <DirectoryPage />;
}
