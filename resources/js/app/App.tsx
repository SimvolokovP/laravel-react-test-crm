import { Toaster } from '@/shared/components/ui/sonner';
import { TooltipProvider } from '@/shared/components/ui/tooltip';
import { Router } from '@/shared/router';

export default function App() {
  return (
    <TooltipProvider>
      <Router />
      <Toaster position="top-right" closeButton />
    </TooltipProvider>
  );
}
