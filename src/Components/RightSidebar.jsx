import React, { useEffect, useState } from 'react';
import { Box, Text, VStack, Button, Avatar, Spinner } from '@chakra-ui/react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { TbUserPlus } from "react-icons/tb";

const groups = [
    { id: 1, name: 'Akarue Maro', members: 400 },
    { id: 2, name: 'shaibu Musa', members: 220 },
    { id: 3, name: 'Asiwaju Tinubu', members: 220 },
];

export default function RightSidebar() {
    const [userData, setUserData] = useState({ fullName: '', profilePhotoUrl: '' });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const docRef = doc(db, "buyers", user.uid);
                const docSnap = await getDoc(docRef);
                console.log("User data fetched:", docSnap.data());
                if (docSnap.exists()) {
                    setUserData(docSnap.data());
                }
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);


    return (
<Box
  bg="white"
  p={4}
  borderRadius="lg"
  shadow="sm"
  h="calc(100vh - 100px)" // or set a specific height like "600px"
  overflowY="auto"
  position="sticky"
  top="80px" // distance from top (adjust based on your navbar height)
>            {loading ? (
                <Spinner />
            ) : (
                <VStack spacing={3} mb={4}>
                    <Avatar size="xl" name={userData.fullName} src={userData.profilePhotoUrl} cursor="pointer" onClick={() => {
                                navigate(`/buyer/profile/${auth.currentUser.uid}`)
                            }}  />
                    <Text fontWeight="bold">{userData.fullName || 'Your Name'}</Text>
                    <Text fontSize="sm" color="gray.500">AgriTech Enthusiast</Text>
                </VStack>
            )}
            
            <Box display="flex" alignItems="center" gap="5px"  mb={3}>
            <Text fontWeight="600" >Requests</Text> 
            <TbUserPlus fontSize="2opx"/>
            </Box>
            <VStack align="start" spacing={3}>
                {groups.map(group => (
                    <Box key={group.id}>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar size="sm" name={group.name} />
                        <Text>{group.name}</Text>
                        </Box>
                        {/* <Text fontSize="sm" color="gray.500">{group.members} members</Text> */}
                        <Button fontSize="16px" border="2px solid" borderRadius="20px" mt={1} bg="transparent">Accept</Button>
                    </Box>
                ))}
            </VStack>
            <Text>see all requests</Text>
            
        </Box>
    )
};

