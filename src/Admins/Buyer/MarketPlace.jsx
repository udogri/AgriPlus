// src/pages/MarketplacePage.jsx
import {
    Box,
    Heading,
    Input,
    Select,
    SimpleGrid,
    Spinner,
    Text,
    VStack,
  } from "@chakra-ui/react";
  import { collection, getDocs, query, where } from "firebase/firestore";
  import { useEffect, useState } from "react";
  import { db } from "../../firebaseConfig";

  import ProductCard from "../../Components/ProductCard";
import DashBoardLayout from "../../DashboardLayout";
  
  const MarketplacePage = ({ user }) => {
    const [inventory, setInventory] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const [loading, setLoading] = useState(false);
  
    // 🔄 Fetch Inventory
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, "farmerInventory")); // all items
        const snapshot = await getDocs(q);
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setInventory(items);
        setFilteredItems(items);
      } catch (error) {
        alert("Error fetching inventory: " + error.message);
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      fetchInventory();
    }, []);
  
    // 🔍 Filter Items
    useEffect(() => {
      let results = [...inventory];
  
      if (search.trim() !== "") {
        results = results.filter((item) =>
          item.name?.toLowerCase().includes(search.toLowerCase())
        );
      }
  
      if (category !== "all") {
        results = results.filter((item) => item.category === category);
      }
  
      setFilteredItems(results);
    }, [search, category, inventory]);
  
    return (
        <DashBoardLayout role="buyer" active="marketplace" showNav={true} showSearch={true}>
      <Box p={6} bg="gray.50" minH="100vh">
        <Heading mb={6}>Marketplace</Heading>
  
        {/* Filters */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={8}>
          <Input
            placeholder="Search for a product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            bg="white"
          />
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            bg="white"
          >
            <option value="all">All Categories</option>
            <option value="Fruits">Fruits</option>
            <option value="Vegetables">Vegetables</option>
            <option value="Grains">Grains</option>
            <option value="Seeds">Seeds</option>
            <option value="Others">Others</option>
          </Select>
        </SimpleGrid>
  
        {/* Product List */}
        {loading ? (
          <Box textAlign="center" mt={20}>
            <Spinner size="xl" />
          </Box>
        ) : filteredItems.length === 0 ? (
          <Text textAlign="center" color="gray.600" fontSize="lg">
            No items found.
          </Text>
        ) : (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
            {filteredItems.map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </SimpleGrid>
        )}
      </Box>
      </DashBoardLayout>
    );
  };
  
  export default MarketplacePage;
  