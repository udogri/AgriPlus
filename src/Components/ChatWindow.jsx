import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebaseConfig";
import { collection, query, orderBy, onSnapshot, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../AuthContext";
import { Box, VStack, HStack, Text, Input, Button, Menu, MenuButton, MenuList, MenuItem, IconButton, InputGroup, InputRightElement } from "@chakra-ui/react";
import DashBoardLayout from "../DashboardLayout";
import { format } from "date-fns";
import { BsThreeDotsVertical, BsEmojiSmile } from "react-icons/bs";
import Picker from 'emoji-picker-react';

export default function ChatWindow() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editingMsgText, setEditingMsgText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!id || !currentUser) return;
    const q = query(collection(db, `connections/${currentUser.uid}/following/${id}/messages`), orderBy("createdAt"));
    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, [id, currentUser]);

  if (!currentUser) {
    return (
      <Box p={4} h="100vh" display="flex" alignItems="center" justifyContent="center">
        <Text>Please log in to view chats.</Text>
      </Box>
    );
  }

  const sendMessage = async () => {
    if (!newMsg.trim()) return;
    await addDoc(collection(db, `connections/${currentUser.uid}/following/${id}/messages`), {
      text: newMsg,
      sender: currentUser.uid,
      createdAt: serverTimestamp(),
    });
    await addDoc(collection(db, `connections/${id}/following/${currentUser.uid}/messages`), {
        text: newMsg,
        sender: currentUser.uid,
        createdAt: serverTimestamp(),
      });
    setNewMsg("");
    setShowEmojiPicker(false);
  };

  const startEdit = (msg) => {
    setEditingMsgId(msg.id);
    setEditingMsgText(msg.text);
  };

  const saveEdit = async () => {
    if (!editingMsgText.trim()) return;
    const msgDocRef = doc(db, `connections/${currentUser.uid}/following/${id}/messages`, editingMsgId);
    await updateDoc(msgDocRef, { text: editingMsgText });
    setEditingMsgId(null);
    setEditingMsgText("");
  };

  const cancelEdit = () => {
    setEditingMsgId(null);
    setEditingMsgText("");
  };

  const deleteMessage = async (msgId) => {
    const msgDocRef = doc(db, `connections/${currentUser.uid}/following/${id}/messages`, msgId);
    await deleteDoc(msgDocRef);
  };

  const onEmojiClick = (event, emojiObject) => {
    setNewMsg(prevMsg => prevMsg + emojiObject.emoji);
  };

  return (
    <DashBoardLayout>
      <Box p={4} h="100vh" display="flex" flexDir="column" bg="gray.50">
        <VStack flex={1} overflowY="auto" align="stretch" spacing={4} p={4}>
          {messages.map((msg) => (
            <HStack key={msg.id} justify={msg.sender === currentUser.uid ? "flex-end" : "flex-start"}>
              <Box
                p={3}
                borderRadius="20px"
                bg={msg.sender === currentUser.uid ? "blue.500" : "gray.200"}
                color={msg.sender === currentUser.uid ? "white" : "black"}
                maxW="70%"
              >
                {editingMsgId === msg.id ? (
                  <VStack align="stretch">
                    <Input value={editingMsgText} onChange={(e) => setEditingMsgText(e.target.value)} />
                    <HStack>
                      <Button size="sm" onClick={saveEdit}>Save</Button>
                      <Button size="sm" onClick={cancelEdit}>Cancel</Button>
                    </HStack>
                  </VStack>
                ) : (
                  <Text>{msg.text}</Text>
                )}
                <Text fontSize="xs" color={msg.sender === currentUser.uid ? "gray.300" : "gray.500"} mt={1}>
                  {msg.createdAt ? format(msg.createdAt.toDate(), "p") : ""}
                </Text>
              </Box>
              {msg.sender === currentUser.uid && (
                <Menu>
                  <MenuButton as={IconButton} icon={<BsThreeDotsVertical />} variant="ghost" size="sm" />
                  <MenuList>
                    <MenuItem onClick={() => startEdit(msg)}>Edit</MenuItem>
                    <MenuItem onClick={() => deleteMessage(msg.id)}>Delete</MenuItem>
                  </MenuList>
                </Menu>
              )}
            </HStack>
          ))}
          <div ref={messagesEndRef} />
        </VStack>
        {showEmojiPicker && <Picker onEmojiClick={onEmojiClick} />}
        <Box mt={3} display="flex" alignItems="center">
          <InputGroup>
            <Input
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              placeholder="Type a message..."
              borderRadius="20px"
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <InputRightElement>
              <IconButton
                icon={<BsEmojiSmile />}
                variant="ghost"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              />
            </InputRightElement>
          </InputGroup>
          <Button onClick={sendMessage} ml={2} borderRadius="20px">Send</Button>
        </Box>
      </Box>
    </DashBoardLayout>
  );
}
