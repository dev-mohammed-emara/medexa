import React, { createContext, useContext, useState, useEffect } from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  toggleSidebar: () => void;
  // For restoring state as requested
  previousCollapsedState: boolean | null;
  setPreviousCollapsedState: (value: boolean | null) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [previousCollapsedState, setPreviousCollapsedState] = useState<boolean | null>(null);

  const toggleSidebar = () => setIsCollapsed(prev => !prev);

  // Sync initial state based on desktop screen size if not already set
  useEffect(() => {
    const isDesktop = window.innerWidth >= 1024;
    setIsCollapsed(!isDesktop);
  }, []);

  return (
    <SidebarContext.Provider 
      value={{ 
        isCollapsed, 
        setIsCollapsed, 
        toggleSidebar, 
        previousCollapsedState, 
        setPreviousCollapsedState 
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};
