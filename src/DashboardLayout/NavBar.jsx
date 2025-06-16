import {
  Box,
  Flex,
  IconButton,
  Img,
  Input,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import { MdLogout } from 'react-icons/md';
import Logo from '../assets/Logo.png';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';


export default function NavBar({  onOpen, btnRef }) {
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      localStorage.clear(); // if you use localStorage for user data
      sessionStorage.clear(); // if needed
      toast({
        title: 'Logged out.',
        description: 'You have successfully logged out.',
        status: 'info',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: 'Error logging out.',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    }
  };


  return (
    <Flex
      align="center"
      px={4}
      py={3}
      justify="space-between"
      borderBottom="1px solid #E2E8F0"
      bg="white"
      shadow="sm"
    >
      {/* Left: Hamburger + Logo */}
      <Flex align="center" flex="1">
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
          width={{ base: "50px", md: "80px" }}
          height="30px"
          objectFit="contain"
        />
      </Flex>

      

      {/* Right: Logout */}
      <Flex justify="flex-end" flex="1">
        <Menu>
          <MenuButton as={IconButton} icon={<MdLogout />} variant="ghost" fontSize="24px" color="green.500" />
          <MenuList>
            <MenuItem onClick={handleLogout}>Confirm Logout</MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Flex>
  );
}
