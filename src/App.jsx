// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import { Box, Flex } from '@chakra-ui/react';
import Home from './LandingPage/Home';
import ContactUs from './LandingPage/ContactUs';
import AboutUs from './LandingPage/AboutUs';
import ScrollToTop from './Components/ScrollToTop';
import FarmerDashboard from './Admins/Farmer/Index';
import FarmerInventory from './Admins/Farmer/FarmerInventory';
import FarmerTransactions from './Admins/Farmer/FarmerTransactions';
import SettingsPage from './Admins/Farmer/Settings';
import LoginSignup from './Auth/LoginSignup';
import ChooseAdmin from './Auth/ChooseAdmin';
import FarmerSignupForm from './Auth/FarmerSignForm';
import BuyerDashboard from './Admins/Buyer/Index';
import MarketplacePage from './Admins/Buyer/MarketPlace';
import CommunityPage from './Admins/Buyer/Community';
import BuyerSignup from './Auth/BuyerSignUpForm';
import UserProfile from './Components/UserProfile';
import CommunityLayout from './Admins/Farmer/community2';
import ChatWindow from './Components/ChatWindow';
import UsersList from './Components/UsersList';
import ChatList from './Components/ChatList'; // Import ChatList
import { AuthProvider } from './AuthContext'; // Import AuthProvider
import Profile from './Admins/Farmer/Profile';

function App() {
  return (
    <Flex direction="column" minHeight="100vh">
      <Box flex="1">
        <ScrollToTop />
        <AuthProvider> {/* Wrap Routes with AuthProvider */}
          <Routes>
            <Route path="/" element={<Home />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/login" element={<LoginSignup />} />
          <Route path="/choose-admin" element={<ChooseAdmin />} />

          {/* Add more routes as needed */}
          <Route path="/farmer/dashboard/:uid" element={<FarmerDashboard />} />
          <Route path="/farmer/inventory" element={<FarmerInventory />} />
          <Route path="/farmer/transactions" element={<FarmerTransactions />} />
          <Route path="/farmer/settings" element={<SettingsPage />} />
          <Route path="/farmer/community" element={<CommunityLayout />} />
          <Route path="/farmer/profile/:uid" element={<Profile />} />



          {/* Add more routes as needed */}
          <Route path="/buyer/dashboard/:uid" element={<BuyerDashboard />} />
          <Route path="/buyer/market" element={<MarketplacePage />} />
          <Route path="/buyer/community" element={<CommunityPage />} />
          <Route path="/buyer/profile/:uid" element={<UserProfile />} />
          <Route path="/userslist" element={<UsersList />} />
          {/* <Route path="/farmer/transactions" element={<FarmerTransactions />} />
          <Route path="/farmer/settings" element={<SettingsPage />} /> */}

          {/* Authentication */}
          <Route path="/farmer-signup" element={<FarmerSignupForm />} />
          <Route path="/buyer-signup" element={<BuyerSignup />} />

          {/* Add more routes as needed */}
          <Route path="/chat/:id" element={<ChatWindow />} />
          <Route path="/chats" element={<ChatList />} /> {/* Add route for ChatList */}
          </Routes>
        </AuthProvider> {/* Close AuthProvider */}
      </Box>
    </Flex>
  );
}

export default App;
