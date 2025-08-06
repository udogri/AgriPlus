import React, { useEffect, useState } from 'react';
import { Box, Grid, Spinner, GridItem, Input, Button } from '@chakra-ui/react';
import LeftSidebar from '../../Components/LeftSidebar';
import Feed from '../../Components/Feed';
import RightSidebar from '../../Components/RightSidebar';
import DashBoardLayout from '../../DashboardLayout';
import { auth, db } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import CreatePostModal from '../../Components/CreatePostModal';

const CommunityLayout = () => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);


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

  const openCreatePostModal = () => {
    setIsCreatePostModalOpen(true);
  };

  const closeCreatePostModal = () => {
    setIsCreatePostModalOpen(false);
  };

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
      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={closeCreatePostModal}
      />
      <Box bg="white" p={4} borderRadius="lg" shadow="sm" width="100%" mb={6}>
        <Input placeholder="Start a post..." mb={2} />
        <Button colorScheme="green" size="sm" onClick={openCreatePostModal}>
          Make post
        </Button>
      </Box>
        <Grid
          templateAreas={{
            base: `"right" "feed"`,
            md: `"feed right"`,
          }}
          templateColumns={{
            base: '1fr',
            md: '1fr 280px',
          }}
          gap={6}
          maxW="1200px"
          mx="auto"
        >
          <GridItem area="feed">
            <Feed />
          </GridItem>
          <GridItem area="right">
            <RightSidebar />
          </GridItem>
        </Grid>
      </Box>
    </DashBoardLayout>
  );
};

export default CommunityLayout;
