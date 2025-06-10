import React, { useState } from 'react';
import {
  Box,
  Button,
  Input,
  Heading,
  VStack,
  useToast,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebaseConfig'; // Make sure db is exported from firebaseConfig
import { FcGoogle } from 'react-icons/fc';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const LoginSignup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  const handleSubmit = async () => {
    try {
      if (isSignup) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: username });

        // Optional: Create a user document in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid, // ✅ Save unique user ID
          email,
          displayName: username,
          createdAt: new Date().toISOString(),
          adminId: '', // will be updated after role is chosen
        });
        

        toast({
          title: 'Account created successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top',

        });

        navigate('/choose-admin'); // ✅ Send to choose-admin after signup
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.exists() ? userDoc.data() : null;

        toast({
          title: 'Logged in successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top',

        });

        if (userData?.adminId) {
          navigate(`/${userData.adminId}/dashboard`);
        } else {
          navigate('/choose-admin'); // If no adminId, prompt to choose admin
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in Firestore
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid, // ✅ add this
          email: user.email,
          displayName: user.displayName,
          createdAt: new Date().toISOString(),
          adminId: '', // will be updated later
        });
      }
      

      const userData = (await getDoc(userRef)).data();

      toast({
        title: 'Logged in with Google.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      if (userData?.adminId) {
        switch (userData.adminId) {
          case 'farmer':
            navigate('/farmer/dashboard');
            break;
          case 'buyer':
            navigate('/buyer/dashboard');
            break;
          case 'logistics':
            navigate('/logistics/dashboard');
            break;
          case 'veterinarian':
            navigate('/veterinarian/dashboard');
            break;
          default:
            navigate('/choose-admin');
        }
      } else {
        navigate('/choose-admin');
      }
      
    } catch (error) {
      toast({
        title: 'Google Sign-In Error',
        description: error.message,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
      <VStack spacing={4} p={6} boxShadow="md" bg="white" borderRadius="md" width="sm">
        <Heading>{isSignup ? 'Sign Up' : 'Log In'}</Heading>

        {isSignup && (
          <FormControl>
            <FormLabel>Username</FormLabel>
            <Input
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </FormControl>
        )}

        <FormControl>
          <FormLabel>Email</FormLabel>
          <Input
            placeholder="Enter email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Password</FormLabel>
          <Input
            placeholder="Enter password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormControl>

        <Button colorScheme="blue" width="full" onClick={handleSubmit}>
          {isSignup ? 'Sign Up' : 'Log In'}
        </Button>

        <Button
          leftIcon={<FcGoogle />}
          colorScheme="gray"
          variant="outline"
          width="full"
          onClick={handleGoogleSignIn}
        >
          Continue with Google
        </Button>

        <Button variant="link" onClick={() => setIsSignup(!isSignup)}>
          {isSignup ? 'Already have an account? Log in' : 'No account? Sign up'}
        </Button>
      </VStack>
    </Box>
  );
};

export default LoginSignup;
