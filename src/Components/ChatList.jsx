import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, query, where, onSnapshot, getDoc, doc, orderBy, limit } from "firebase/firestore";
import { useAuth } from "../AuthContext";
import { Box, VStack, Text, Avatar, HStack, Spinner } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import DashBoardLayout from "../DashboardLayout";

export default function ChatList() {
    const { currentUser } = useAuth();
    const [chats, setChats] = useState([]);
    const [lastMessages, setLastMessages] = useState({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            setChats([]);
            return;
        }

        setLoading(true);
        const q = query(collection(db, "followers"), where("followerId", "==", currentUser.uid));

        const unsub = onSnapshot(q, async (snapshot) => {
            const fetchedChats = await Promise.all(snapshot.docs.map(async (d) => {
                const followingId = d.data().followingId;
                let userProfile = null;

                let profileSnap = await getDoc(doc(db, "buyers", followingId));
                if (profileSnap.exists()) {
                    userProfile = { id: profileSnap.id, ...profileSnap.data() };
                } else {
                    profileSnap = await getDoc(doc(db, "farmers", followingId));
                    if (profileSnap.exists()) {
                        userProfile = { id: profileSnap.id, ...profileSnap.data() };
                    }
                }
                return userProfile;
            }));
            
            const validChats = fetchedChats.filter(Boolean);
            setChats(validChats);

            validChats.forEach(chat => {
                const messagesQuery = query(
                    collection(db, `connections/${currentUser.uid}/following/${chat.id}/messages`),
                    orderBy("createdAt", "desc"),
                    limit(1)
                );
                onSnapshot(messagesQuery, (messagesSnapshot) => {
                    if (!messagesSnapshot.empty) {
                        const lastMsg = messagesSnapshot.docs[0].data();
                        setLastMessages(prev => ({ ...prev, [chat.id]: lastMsg.text }));
                    }
                });
            });

            setLoading(false);
        }, (error) => {
            console.error("Error fetching chat list:", error);
            setLoading(false);
        });

        return () => {
            unsub();
        };
    }, [currentUser]);

    if (loading) {
        return (
            <Box minH="100vh" display="flex" justifyContent="center" alignItems="center">
                <Spinner size="xl" />
            </Box>
        );
    }

    return (
        <DashBoardLayout>
            <VStack align="stretch" spacing={3} p={4}>
                <Text fontWeight="bold" fontSize="xl" mb={4}>Following</Text>
                {chats.length === 0 ? (
                    <Text color="gray.500">You are not following anyone.</Text>
                ) : (
                    chats.map((user) => (
                        <HStack
                            key={user.id}
                            p={3}
                            borderWidth="1px"
                            borderRadius="lg"
                            shadow="sm"
                            cursor="pointer"
                            _hover={{ bg: "gray.50" }}
                            onClick={() => navigate(`/chat/${user.id}`)}
                        >
                            <Avatar
                                size="md"
                                name={user.fullName || "Unknown User"}
                                src={user.profilePhotoUrl}
                            />
                            <Box flex="1">
                                <Text fontWeight="bold">{user.fullName || "Unknown User"}</Text>
                                <Text fontSize="sm" color="gray.500" isTruncated>
                                    {lastMessages[user.id] || "No messages yet"}
                                </Text>
                            </Box>
                        </HStack>
                    ))
                )}
            </VStack>
        </DashBoardLayout>
    );
}
