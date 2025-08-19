// src/Pages/Community/CommunityLayout.jsx
import React, { useEffect, useState } from 'react';
import { 
  Box, Grid, Spinner, GridItem, Input, Button, IconButton, Tooltip 
} from '@chakra-ui/react';
import { FaUsers } from 'react-icons/fa';
import LeftSidebar from '../../Components/LeftSidebar';
import Feed from '../../Components/Feed';
import RightSidebar from '../../Components/RightSidebar';
import DashBoardLayout from '../../DashboardLayout';
import { auth, db } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import CreatePostModal from '../../Components/CreatePostModal';
import { useNavigate } from 'react-router-dom';

const CommunityLayout = () => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const navigate = useNavigate();

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
      <Box bg="gray.100" minH="100vh" py={6} px={4} position="relative">
        {/* Create Post Modal */}
        <CreatePostModal
          isOpen={isCreatePostModalOpen}
          onClose={closeCreatePostModal}
        />

        {/* Start a Post */}
        <Box bg="white" p={4} borderRadius="lg" shadow="sm" width="100%" mb={6}>
          <Input placeholder="Start a post..." mb={2} />
          <Button colorScheme="green" size="sm" onClick={openCreatePostModal}>
            Make post
          </Button>
        </Box>

        {/* Main Layout */}
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
          <GridItem area="feed" w="100%" maxW="100%" overflowX="hidden">
            <Feed />
          </GridItem>
          <GridItem area="right">
            <RightSidebar />
          </GridItem>
        </Grid>

        {/* Floating UserList Icon Bubble */}
        <Tooltip label="View All Users" placement="left">
          <IconButton
            icon={<FaUsers />}
            colorScheme="blue"
            borderRadius="full"
            size="lg"
            shadow="lg"
            position="fixed"
            bottom="30px"
            right="30px"
            onClick={() => navigate('/userlist')}
            aria-label="View all users"
          />
        </Tooltip>
      </Box>
    </DashBoardLayout>
  );
};

export default CommunityLayout;
