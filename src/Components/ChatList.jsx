import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useAuth } from "../AuthContext";
import { Box, VStack, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";


export default function ChatList() {
const { currentUser } = useAuth();
const [chats, setChats] = useState([]);
const navigate = useNavigate();


useEffect(() => {
if (!currentUser) return;
const q = query(collection(db, "connections"), where("users", "array-contains", currentUser.uid));
const unsub = onSnapshot(q, (snapshot) => {
setChats(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
});
return unsub;
}, [currentUser]);


return (
<VStack align="stretch" spacing={3} p={4}>
<Text fontWeight="bold">Chats</Text>
{chats.map((chat) => (
<Box
key={chat.id}
p={3}
border="1px solid #ccc"
borderRadius="md"
cursor="pointer"
onClick={() => navigate(`/chat/${chat.id}`)}
>
<Text>Conversation</Text>
</Box>
))}
</VStack>
);
}