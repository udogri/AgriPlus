// src/components/layout/NavBar.jsx
import {
    Box,
    Flex,
    Heading,
    IconButton,
    Img,
    Input,
    Spacer,
  } from '@chakra-ui/react';
  import { HamburgerIcon } from '@chakra-ui/icons';
  import Logo from '../assets/Logo.png'; // Adjust the path to your logo image
  
  export default function NavBar({ showSearch = true, onOpen, btnRef }) {
    return (
      <Flex
        align="center"
        px={4}
        py={3}
        borderBottom="1px solid #E2E8F0"
        bg="white"
        shadow="sm"
      >
        {/* Hamburger icon for mobile */}
        <Box display={["block", null, null, "none"]}>
          <IconButton
            icon={<HamburgerIcon />}
            variant="outline"
            aria-label="Open menu"
            onClick={onOpen}
            ref={btnRef}
            mr={4}
          />
        </Box>
  
        <Img
  src={Logo}
  alt="Logo"
  width="auto"
  height="30px"  // or whatever height fits your layout
  mr={4}
  objectFit="contain"
/>

  
        {showSearch && (
          <Input
            placeholder="Search..."
            maxW="300px"
            size="sm"
            bg="gray.100"
          />
        )}
  
        <Spacer />
        {/* Add right-aligned content like avatar or notification here */}
      </Flex>
    );
  }
  