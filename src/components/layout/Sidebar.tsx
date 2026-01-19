/**
 * Componente Sidebar - Menú lateral
 */

import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Box,
} from '@mui/material';
import {
  Assessment,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';

const drawerWidth = 240;

interface MenuItem {
  text: string;
  icon: React.ReactElement;
  path: string;
  adminOnly?: boolean;
}

const menuItems: MenuItem[] = [
  {
    text: 'Reportes',
    icon: <Assessment />,
    path: '/reportes',
  },
  {
    text: 'Gestión de Roles',
    icon: <AdminPanelSettings />,
    path: '/admin/roles',
    adminOnly: true,
  },
  // Nota: "Gestión de Permisos" se accede desde cada rol en "Gestión de Roles"
  // No tiene sentido como menú independiente porque requiere un rolId
];

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarOpen } = useUIStore();
  const { usuario } = useAuthStore();
  
  const isAdmin = usuario?.role === 'Administrador';
  
  const filteredMenuItems = menuItems.filter(
    (item) => !item.adminOnly || isAdmin
  );
  
  const handleNavigation = (path: string) => {
    navigate(path);
  };
  
  return (
    <Drawer
      variant="persistent"
      open={sidebarOpen}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {filteredMenuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleNavigation(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
      </Box>
    </Drawer>
  );
};
