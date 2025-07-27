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
import { TfiMoney } from 'react-icons/tfi';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export default function SideBar({ role = 'farmer' }) {
  const [userData, setUserData] = useState({ fullName: '', profilePhotoUrl: '' });
  const [uid, setUid] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);

        // ✅ Assuming buyers are stored in "buyers" collection
        const docRef = doc(db, role === 'buyer' ? 'buyers' : 'farmers', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [role]);

  // Links based on role
  const roleLinks = {
    farmer: [
      { label: 'Home', path: '/farmer/community', icon: MdFavorite },
      { label: 'Dashboard', path: uid ? `/farmer/dashboard/${uid}` : '/farmer/dashboard', icon: MdDashboard },
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
      { label: 'Home', path: '/buyer/community', icon: MdFavorite },
      { label: 'Dashboard', path: uid ? `/buyer/dashboard/${uid}` : '/buyer/dashboard', icon: MdDashboard },
      { label: 'Marketplace', path: '/buyer/market', icon: TfiMoney },
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
      {!loading && (
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
      )}
    </Box>
  );
}
