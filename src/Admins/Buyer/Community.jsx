import React from 'react';
import { Box, Grid } from '@chakra-ui/react';
import LeftSidebar from '../../Components/LeftSidebar';
import Feed from '../../Components/Feed';
import RightSidebar from '../../Components/RightSidebar';
import DashBoardLayout from '../../DashboardLayout';


const CommunityLayout = () => {
  return (
    <DashBoardLayout  role="buyer" active="community">
    <Box bg="gray.100" minH="100vh" py={6} px={4}>
      <Grid
        templateColumns={['1fr', '1fr', '250px 1fr 250px']}
        gap={6}
        maxW="1200px"
        mx="auto"
      >
        <LeftSidebar />
        <Feed />
        <RightSidebar />
      </Grid>
    </Box>
    </DashBoardLayout>
  );
};

export default CommunityLayout;
