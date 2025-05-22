// src/components/layout/DashBoardLayout.jsx
import { Box, Flex, useDisclosure, Drawer, DrawerOverlay, DrawerContent } from '@chakra-ui/react';
import { useRef } from 'react';
import NavBar from './NavBar';
import SideBar from './SideBar';

export default function DashBoardLayout({
  children,
  active = '',
  showNav = true,
  showSearch = true,
  role = 'farmer'
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef();

  return (
    <Box bg="gray.50" minH="100vh">
      {/* Fixed Sidebar for Large Screens */}
      <Flex>
        <Box display={["none", null, null, "block"]} w="20%" pos="fixed">
          <SideBar active={active} role={role} />
        </Box>

        {/* Main content area */}
        <Box
          ml={["0", null, null, "20%"]}
          w={["100%", null, null, "80%"]}
          minH="100vh"
        >
          {showNav && <NavBar showSearch={showSearch} onOpen={onOpen} btnRef={btnRef} />}
          <Box p={4}>{children}</Box>
        </Box>
      </Flex>

      {/* Sidebar Drawer for small screens */}
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent>
          <SideBar active={active} role={role} />
        </DrawerContent>
      </Drawer>
    </Box>
  );
}
