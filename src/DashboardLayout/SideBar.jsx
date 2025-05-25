// src/components/layout/SideBar.jsx
import {
    Box,
    VStack,
    Text,
    Button,
    Divider,
  } from '@chakra-ui/react';
  import { useNavigate } from 'react-router-dom';
  
  export default function SideBar({ active, role = "farmer" }) {
    const navigate = useNavigate();
  
    const roleLinks = {
      farmer: [
        { label: 'Dashboard', path: '/farmer/dashboard' },
        { label: 'Inventory', path: '/farmer/inventory' },
        { label: 'Transaction History', path: '/farmer/transactions' },
        { label: 'Settings', path: '/farmer/settings' },
      ],
      vet: [
        { label: 'Dashboard', path: '/dashboard/vet' },
        { label: 'Appointments', path: '/dashboard/vet/appointments' },
        { label: 'Prescriptions', path: '/dashboard/vet/prescriptions' },
        { label: 'Settings', path: '/dashboard/vet/settings' },
      ],
      logistics: [
        { label: 'Dashboard', path: '/dashboard/logistics' },
        { label: 'Deliveries', path: '/dashboard/logistics/deliveries' },
        { label: 'Fleet', path: '/dashboard/logistics/fleet' },
        { label: 'Settings', path: '/dashboard/logistics/settings' },
      ],
      buyer: [
        { label: 'Dashboard', path: '/dashboard/buyer' },
        { label: 'Orders', path: '/dashboard/buyer/orders' },
        { label: 'Favorites', path: '/dashboard/buyer/favorites' },
        { label: 'Settings', path: '/dashboard/buyer/settings' },
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
          {links.map((link) => (
            <Button
              key={link.path}
              onClick={() => navigate(link.path)}
              color={active === link.label ? '#39996B' : 'black'}
              variant={active === link.label ? 'solid' : 'ghost'}
              justifyContent="flex-start"
            >
              {link.label}
            </Button>
          ))}
        </VStack>
      </Box>
    );
  }
  