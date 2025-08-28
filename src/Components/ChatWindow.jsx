import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebaseConfig";
import { collection, query, orderBy, onSnapshot, addDoc } from "firebase/firestore";
import { useAuth } from "../AuthContext";
import { Box, VStack, Text, Input, Button } from "@chakra-ui/react";
import DashBoardLayout from "../DashboardLayout";

export default function ChatWindow() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");

  useEffect(() => {
    if (!id || !currentUser) return; // Ensure currentUser is available before fetching messages
    const q = query(collection(db, `connections/${id}/messages`), orderBy("createdAt"));
    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, [id, currentUser]); // Add currentUser to dependency array

  // If currentUser is not available, render a loading state or redirect
  if (!currentUser) {
    return (
      <Box p={4} h="100vh" display="flex" alignItems="center" justifyContent="center">
        <Text>Please log in to view chats.</Text>
      </Box>
    );
  }


  const sendMessage = async () => {
    if (!newMsg) return;
    await addDoc(collection(db, `connections/${id}/messages`), {
      text: newMsg,
      sender: currentUser.uid,
      createdAt: new Date(),
    });
    setNewMsg("");
  };


  return (
    <DashBoardLayout>
    <Box p={4} h="100vh" display="flex" flexDir="column">
      <VStack flex={1} overflowY="auto" align="stretch" spacing={2}>
        {messages.map((msg) => (
          <Box key={msg.id} p={2} borderRadius="md" bg={msg.sender === currentUser.uid ? "blue.100" : "gray.100"}>
            <Text>{msg.text}</Text>
          </Box>
        ))}
      </VStack>
      <Box mt={3} display="flex">
        <Input value={newMsg} onChange={(e) => setNewMsg(e.target.value)} placeholder="Type a message..." />
        <Button onClick={sendMessage} ml={2}>Send</Button>
      </Box>
    </Box>
    </DashBoardLayout>
  );
}
