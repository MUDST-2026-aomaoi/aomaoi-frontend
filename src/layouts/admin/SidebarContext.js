import { createContext, useContext } from 'react';

// Provided by AdminLayout so PageHeader can render the mobile menu button.
// Defaults to null (e.g. SuperAdminLayout, which has no drawer).
export const SidebarContext = createContext(null);

export function useSidebar() {
  return useContext(SidebarContext);
}
