import React, { useEffect, useState } from 'react';
import { Box, Grid, Spinner } from '@chakra-ui/react';
import LeftSidebar from '../../Components/LeftSidebar';
import Feed from '../../Components/Feed';
import RightSidebar from '../../Components/RightSidebar';
import DashBoardLayout from '../../DashboardLayout';
import { auth, db } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const CommunityLayout = () => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setRole(userData.adminId || 'guest'); // e.g., 'farmer' or 'buyer'
        } else {
          setRole('guest');
        }
      } else {
        setRole('guest');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <Box minH="100vh" display="flex" justifyContent="center" alignItems="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <DashBoardLayout role={role} active="community">
      <Box bg="gray.100" minH="100vh" py={6} px={4}>
      <Grid
  templateColumns={['1fr', null, '1fr']}
  templateAreas={[
    `"feed" 
     "sidebar"`,  // Mobile (sidebar below feed)
    null,
    `"sidebar"
     "feed"`       // Desktop (sidebar on top, feed below)
  ]}
  gap={6}
  maxW="1200px"
  mx="auto"
>
  <Box gridArea="sidebar">
    <RightSidebar />
  </Box>
  <Box gridArea="feed">
    <Feed />
  </Box>
</Grid>

      </Box>
    </DashBoardLayout>
  );
};

export default CommunityLayout;
