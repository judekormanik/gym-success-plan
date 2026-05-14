import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import BottomNav from './components/BottomNav.jsx';
import Navbar from './components/Navbar.jsx';
import Toast from './components/Toast.jsx';
import InstallPrompt from './components/InstallPrompt.jsx';
import useStore from './store/useStore.js';
import useProfile from './hooks/useProfile.js';

const Landing = lazy(() => import('./pages/Landing.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Workout = lazy(() => import('./pages/Workout.jsx'));
const Library = lazy(() => import('./pages/Library.jsx'));
const Builder = lazy(() => import('./pages/Builder.jsx'));
const Progress = lazy(() => import('./pages/Progress.jsx'));
const Nutrition = lazy(() => import('./pages/Nutrition.jsx'));
const Community = lazy(() => import('./pages/Community.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const Checkout = lazy(() => import('./pages/Checkout.jsx'));
const CheckoutSuccess = lazy(() => import('./pages/CheckoutSuccess.jsx'));
const CheckoutCancel = lazy(() => import('./pages/CheckoutCancel.jsx'));
const Onboarding = lazy(() => import('./components/Onboarding.jsx'));
const Privacy = lazy(() => import('./pages/Privacy.jsx'));
const Terms = lazy(() => import('./pages/Terms.jsx'));

function PageFrame({ children }) {
  return (
    <div className="app">
      <Sidebar />
      <Navbar />
      <main className="main">{children}</main>
      <BottomNav />
      <Toast />
      <InstallPrompt />
    </div>
  );
}

function PublicFrame({ children }) {
  return (
    <div className="app">
      {children}
      <Toast />
    </div>
  );
}

function RequireAuth({ children }) {
  const user = useStore((s) => s.user);
  const profile = useStore((s) => s.profile);
  const bootstrapped = useStore((s) => s.bootstrapped);
  const location = useLocation();

  // Wait for the initial session check to resolve before deciding what to do.
  // Without this guard, a fresh load of /workout/build would briefly see
  // user=null, redirect to /, and the Landing redirect would then send the
  // user to /dashboard instead of their intended destination.
  if (!bootstrapped) return <PageLoader />;

  if (!user) return <Navigate to="/" replace state={{ from: location }} />;
  if (profile && !profile.onboarded) return <Navigate to="/onboarding" replace />;
  return children;
}

function PageLoader() {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'grid', placeItems: 'center',
      background: 'var(--bg)',
      zIndex: 1,
    }}>
      <div className="brand-mark" style={{ width: 44, height: 44, fontSize: 18, animation: 'pulse 1.4s ease-in-out infinite' }}>G</div>
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes location={location}>
        <Route path="/" element={<PublicFrame><Landing /></PublicFrame>} />
        <Route path="/checkout" element={<PublicFrame><Checkout /></PublicFrame>} />
        <Route path="/checkout-success" element={<PublicFrame><CheckoutSuccess /></PublicFrame>} />
        <Route path="/checkout-cancel" element={<PublicFrame><CheckoutCancel /></PublicFrame>} />
        <Route path="/onboarding" element={<PublicFrame><Onboarding /></PublicFrame>} />
        <Route path="/privacy" element={<PublicFrame><Privacy /></PublicFrame>} />
        <Route path="/terms" element={<PublicFrame><Terms /></PublicFrame>} />

        <Route path="/dashboard" element={<RequireAuth><PageFrame><Dashboard /></PageFrame></RequireAuth>} />
        <Route path="/workout" element={<RequireAuth><PageFrame><Workout /></PageFrame></RequireAuth>} />
        <Route path="/workout/library" element={<RequireAuth><PageFrame><Library /></PageFrame></RequireAuth>} />
        <Route path="/workout/build" element={<RequireAuth><PageFrame><Builder /></PageFrame></RequireAuth>} />
        <Route path="/workout/build/:id" element={<RequireAuth><PageFrame><Builder /></PageFrame></RequireAuth>} />
        <Route path="/progress" element={<RequireAuth><PageFrame><Progress /></PageFrame></RequireAuth>} />
        <Route path="/nutrition" element={<RequireAuth><PageFrame><Nutrition /></PageFrame></RequireAuth>} />
        <Route path="/community" element={<RequireAuth><PageFrame><Community /></PageFrame></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><PageFrame><Profile /></PageFrame></RequireAuth>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  const initSession = useStore((s) => s.initSession);
  const flushQueue = useStore((s) => s.flushQueue);
  useProfile();

  useEffect(() => {
    initSession();
    const setOnline = (v) => useStore.setState({ online: v });
    const onOnline = () => { setOnline(true); flushQueue(); };
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener?.('message', (e) => {
        if (e.data?.type === 'flush-sync-queue') flushQueue();
      });
    }
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [initSession, flushQueue]);

  return <AnimatedRoutes />;
}
