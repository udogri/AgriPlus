// src/components/layout/SideBar.jsx
import {
  Box,
  VStack,
  Text,
  Button,
  Divider,
  Icon,
} from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  MdDashboard,
  MdOutlineInventory,
  MdHistory,
  MdSettings,
  MdLocalShipping,
  MdFavorite,
  MdPets,
  MdDirectionsCar,
  MdCalendarToday,
} from 'react-icons/md';
import { TfiMoney } from "react-icons/tfi";


export default function SideBar({ role = 'farmer' }) {
  console.log("Current role in Sidebar:", role); // Add this inside SideBar component

  const navigate = useNavigate();
  const location = useLocation();

  const roleLinks = {
    farmer: [
      { label: 'Dashboard', path: '/farmer/dashboard', icon: MdDashboard },
      { label: 'Inventory', path: '/farmer/inventory', icon: MdOutlineInventory },
      { label: 'Transaction History', path: '/farmer/transactions', icon: MdHistory },
      { label: 'Settings', path: '/farmer/settings', icon: MdSettings },
    ],
    vet: [
      { label: 'Dashboard', path: '/dashboard/vet', icon: MdDashboard },
      { label: 'Appointments', path: '/dashboard/vet/appointments', icon: MdCalendarToday },
      { label: 'Prescriptions', path: '/dashboard/vet/prescriptions', icon: MdPets },
      { label: 'Settings', path: '/dashboard/vet/settings', icon: MdSettings },
    ],
    logistics: [
      { label: 'Dashboard', path: '/dashboard/logistics', icon: MdDashboard },
      { label: 'Deliveries', path: '/dashboard/logistics/deliveries', icon: MdLocalShipping },
      { label: 'Fleet', path: '/dashboard/logistics/fleet', icon: MdDirectionsCar },
      { label: 'Settings', path: '/dashboard/logistics/settings', icon: MdSettings },
    ],
    buyer: [
      { label: 'Dashboard', path: '/buyer/dashboard', icon: MdDashboard },
      { label: 'marketplace', path: '/buyer/market', icon: TfiMoney },
      { label: 'community', path: '/buyer/community', icon: MdFavorite },
      { label: 'Settings', path: '/dashboard/buyer/settings', icon: MdSettings },
    ],
  };

  const links = roleLinks[role.toLowerCase()] || [];

  return (
    <Box bg="gray.100" w="100%" h="100vh" p={4}>
      <Text fontSize="xl" fontWeight="bold" mb={4}>
        {role.charAt(0).toUpperCase() + role.slice(1)} Panel
      </Text>
      <Divider mb={4} />
      <VStack align="stretch" spacing={3}>
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Button
              key={link.path}
              onClick={() => navigate(link.path)}
              color={isActive ? '#39996B' : 'black'}
              variant={isActive ? 'solid' : 'ghost'}
              justifyContent="flex-start"
              leftIcon={<Icon as={link.icon} boxSize={5} />}
            >
              {link.label}
            </Button>
          );
        })}
      </VStack>
    </Box>
  );
}
