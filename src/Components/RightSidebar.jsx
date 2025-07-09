import React, { useEffect, useState } from 'react';
import { Box, Text, VStack, Button, Avatar, Spinner } from '@chakra-ui/react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const groups = [
    { id: 1, name: 'Agri Innovators', members: 400 },
    { id: 2, name: 'Poultry Experts', members: 220 },
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
        <Box bg="white" p={4} borderRadius="lg" shadow="sm">
            {loading ? (
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
            <Text fontWeight="bold" mb={3}>Suggested Groups</Text>
            <VStack align="start" spacing={3}>
                {groups.map(group => (
                    <Box key={group.id}>
                        <Text>{group.name}</Text>
                        <Text fontSize="sm" color="gray.500">{group.members} members</Text>
                        <Button size="xs" mt={1} colorScheme="blue">Join</Button>
                    </Box>
                ))}
            </VStack>
        </Box>
    )
};

