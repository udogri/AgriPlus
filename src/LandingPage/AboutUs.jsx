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
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Grid,
    useColorModeValue,
    grid,
} from '@chakra-ui/react';
import { FaArrowRight } from 'react-icons/fa';
import { FaHandHoldingHeart } from "react-icons/fa6";
import { LuPenTool } from "react-icons/lu";
import eggs from "../Assets/eggs.jpg";
import Tomatoes from "../Assets/Tomatoes.jpg";
import Yam from "../Assets/Yam.jpeg";
import { PiHandHeartBold, PiPlant, PiHandCoins } from "react-icons/pi";
import { LiaHandshake } from "react-icons/lia";
import MainLayout from '../LandingLayout'

import { PiShootingStar } from "react-icons/pi";


export default function AboutUs() {



    return (
        <MainLayout>
            <Box position="relative" zIndex="900" overflow="hidden" py={{ base: "30px", md: "70px" }} px="50px">
        
                <Text fontSize={{ base: "30px", md: "50px" }} fontWeight="600" color="black" >
                    Who We{" "}
                    <Text as="span" color="#8C9492">
                        Are
                    </Text>
                </Text>
                <Text fontSize={{ base: "14px", md: "17px" }} color="#71717A">
                AgriPlus is built on a simple but powerful belief: every stakeholder in agriculture deserves access to opportunity, connection, and growth—regardless of location or resources.

We bring together farmers, veterinarians, logistics providers, and clients on one seamless platform to create a thriving agricultural ecosystem. By providing tools, services, and networks, we help bridge the gap between potential and productivity.

With the support of passionate professionals and forward-thinking partners, we’re not just improving how agriculture works—we’re empowering those who make it possible, one connection at a time.
                </Text>

                <Box
                    mt="50px"
                    display="flex"
                    flexWrap="wrap"
                    justifyContent="center"
                    gap="25px"
                >
                    <Image src={eggs} borderRadius="20px" maxW={{ base: "100%", sm: "45%", md: "22%" }} w="100%" />
                    <Image src={Tomatoes} borderRadius="20px" maxW={{ base: "100%", sm: "45%", md: "22%" }} w="100%" />
                    <Image src={Yam} borderRadius="20px" maxW={{ base: "100%", sm: "45%", md: "22%" }} w="100%" />
                    <Image src={eggs} borderRadius="20px" maxW={{ base: "100%", sm: "45%", md: "22%" }} w="100%" />
                </Box>

                <Text fontSize={{ base: "30px", md: "50px" }} mt="20px" fontWeight="600" color="black" >
                    Our{" "}
                    <Text as="span" color="#8C9492">
                        Mission
                    </Text>
                </Text>
                <Text fontSize={{ base: "14px", md: "17px" }} color="#71717A">
                Empowering sustainable agriculture through innovation, collaboration,
                 and commitment to food security.
                </Text>
            </Box>

            

            

            <Box align="center"  justifyContent="center" bg="#E5FFF3" py={{base:"100px", md: "135px"}} px={{base:"30px", md: "40px", lg: "100px"}} >

            <Text  fontSize={{base:"23px", md:"50px"}} fontWeight="700" textAlign="center" mb={{base:"30px", md:"50px"}} >
              AgriPlus’{" "}
              <Text as="span" color="#8C9492">
                Values
              </Text>
            </Text>

            <Grid display="grid" w="100%"   gap="18px" templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} >
              <Box mx="auto" justifyContents="center" maxW={{ base: "300px", md: "357px" }} alignItems="center" borderRadius="30px"  >
                <VStack textAlign="center" bg="#B7EED4" borderRadius="30px" justifyContent="center" h="168px"  align="center" >
                <PiShootingStar fontSize="42px" />
                </VStack>
                <Text fontSize={{ base: "18px", md: "20px", lg: "24px" }} fontWeight="600" mt="20px" >Sustainability</Text>
                <Text fontSize={{ base: "12px", md: "13px", lg: "14px" }} fontWeight="400" mt="20px" letterSpacing="-2%" color="#71717A" >
                We are committed to practices that protect natural resources, reduce environmental impact,
                 and ensure long-term agricultural viability.

                </Text>
              </Box>
              <Box mx="auto" justifyContents="center" maxW={{ base: "300px", md: "357px" }} alignItems="center"      borderRadius="30px"  >
                <VStack textAlign="center" bg="#B7EED4" borderRadius="30px" justifyContent="center" h="168px"  align="center" >
                <LuPenTool fontSize="42px" />
                </VStack>
                <Text fontSize={{ base: "18px", md: "20px", lg: "24px" }} fontWeight="600" mt="20px" >Innovation</Text>
                <Text fontSize={{ base: "12px", md: "13px", lg: "14px" }} fontWeight="400" mt="20px" letterSpacing="-2%" color="#71717A" >
                We drive progress by embracing new technologies, research, and data-driven solutions to meet
                 the evolving needs of modern agriculture.

                </Text>
              </Box>
              <Box mx="auto" justifyContents="center" maxW={{ base: "300px", md: "357px" }} alignItems="center"  borderRadius="30px"  >
                <VStack textAlign="center" bg="#B7EED4" borderRadius="30px" justifyContent="center" h="168px"  align="center" >
                <LiaHandshake fontSize="42px" />
                </VStack>
                <Text fontSize={{ base: "18px", md: "20px", lg: "24px" }} fontWeight="600" mt="20px" >Collaboration</Text>
                <Text fontSize={{ base: "12px", md: "13px", lg: "14px" }} fontWeight="400" mt="20px" letterSpacing="-2%" color="#71717A" >
                We believe in the power of partnerships—with farmers, governments,
                 NGOs, and the private sector—to create meaningful, scalable impact.

                </Text>
              </Box>
            </Grid>

          </Box>
          </MainLayout>
    );
};


