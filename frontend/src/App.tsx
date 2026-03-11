import React from 'react';
import Dashboard from './components/Dashboard';
import { TooltipProvider } from './components/ui/tooltip';

function App(): React.JSX.Element {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <Dashboard />
      </div>
    </TooltipProvider>
  );
}

export default App;
