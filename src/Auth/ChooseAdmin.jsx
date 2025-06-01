import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Stack,
  Image,
  Icon,
  HStack,
  VStack,
  SimpleGrid,
  Spacer,
} from '@chakra-ui/react';
import { FaArrowRight } from 'react-icons/fa';

import { useNavigate } from 'react-router-dom';

export default function WaysToContribute() {

  const navigate = useNavigate();
  return (
      <Flex
          direction="column"
          align={{ base: "center", md: "flex-start" }}
          justify="center"
          position="relative"
          overflow="hidden"
          gap={10}
          px={{ base: "20px", lg: "30px" }}
          py={{ base: 10, md: 20 }}
          bg="white"
          color="white"
      >
          

          {/* Header Text */}
          <Stack
              w="100%"
              align="flex-start"
              textAlign="left"
              mb="30px"
          >
              <Text fontSize="15px" w="fit-content" color="#FAA51C" fontWeight="700">
                 Choose an Admin
              </Text>
              <Text fontSize={{ base: "25px", md: "50px" }} fontWeight="600" color="black">
              Choose an{" "}
                  <Text as="span" color="#8C9492">
                  Admin
                  </Text>
              </Text>
          </Stack>

          {/* Role Cards */}
          <SimpleGrid
              columns={{ base: 1, md: 2, lg: 2 }}
              spacing="20px"
              maxW="100%"
          >
              {[
                  {
                      title: "sponsor",
                      description: `Every student we support is one step closer to achieving their biggest dreams. Your generosity helps provide the essential resources they need to excel in school and far beyond.`,
                      bg: "#D8FFEC",
                      action: "start sponsoring",
                  },
                  {
                      title: "School Admin",
                      description: `Every student we support is one step closer to achieving their biggest dreams. Your generosity helps provide the essential resources they need to excel in school and far beyond.`,
                      bg: "#D8FFEC",
                      action: "start partnering",
                      label: { text: "Partner role", color: "#FFBC4F", bg: "#FFF7EA" },
                  },
                  {
                      title: "Scholarship Admin",
                      description: `Every student we support is one step closer to achieving their biggest dreams. Your generosity helps provide the essential resources they need to excel in school and far beyond.`,
                      bg: "#D8FFEC",
                      action: "start volunteering",
                      label: { text: "Volunteer role", color: "#FFBC4F", bg: "#FFF7EA" },
                  },
                  {
                      title: "Fund Admin",
                      description: `Every student we support is one step closer to achieving their biggest dreams. Your generosity helps provide the essential resources they need to excel in school and far beyond.`,
                      bg: "#D8FFEC",
                      action: "start volunteering",
                      label: { text: "Volunteer role", color: "#FFBC4F", bg: "#FFF7EA" },
                  },
              ].map((role, i) => (
                  <Box
                      key={i}
                      w="100%"
                      bgImage={role.bgImage}
                      bgSize="cover"
                      bgPosition="center"
                      bgRepeat="no-repeat"
                      borderRadius="30px"
                      boxShadow="0px 4px 20px rgba(0, 0, 0, 0.1)"
                      p={{ base: "15px", md: "25px" }}
                      minH="250px"
                      display="flex"
                      flexDirection="column"
                      justifyContent="space-between"
                  >
                      <HStack justifyContent="space-between" mb="15px">
                          {role.icon}
                      </HStack>

                      <VStack align="start" spacing={3} h="100%">
                          <Flex justify="space-between" w="full" align="center">
                              <Text fontSize={{ base: "16px", md: "18px" }} fontWeight="600" color="#2E2B24">
                                  {role.title}
                              </Text>
                              {role.label && (
                                  <Text
                                      fontSize="12px"
                                      px="6px"
                                      border="0.6px solid"
                                      borderColor={role.label.color}
                                      color={role.label.color}
                                      borderRadius="4px"
                                      bg={role.label.bg}
                                      w="fit-content"
                                  >
                                      {role.label.text}
                                  </Text>
                              )}
                          </Flex>

                          <Text fontSize={{ base: "13px", md: "15px" }} color="#71717A" >
                              {role.description}
                          </Text>

                          <Spacer />
                          <Button
                              size="sm"
                              variant="outline"
                              _focus={{ boxShadow: 'none' }}
                              color="#39996B"
                              borderColor="#39996B"
                              _hover={{ bg: "#39996B", color: "white" }}
                              fontSize={{ base: "13px", md: "14px" }}
                              onClick={() => navigate("/sign-up")}
                          >
                              {role.action}
                          </Button>
                      </VStack>
                  </Box>
              ))}
          </SimpleGrid>


      </Flex>
  );
}
