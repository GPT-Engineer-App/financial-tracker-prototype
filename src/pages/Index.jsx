import React, { useState, useRef } from "react";
import { Box, Button, Container, Flex, FormControl, FormLabel, Input, Select, Stack, Text, VStack, HStack, IconButton, Table, Thead, Tbody, Tr, Th, Td, Textarea, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter } from "@chakra-ui/react";
import { FaEdit, FaTrash, FaFileExport, FaFileImport, FaPlus } from "react-icons/fa";

// Mocked data for transactions
const initialTransactions = [
  { id: 1, date: "2023-01-01", amount: 500, type: "income", category: "Salary" },
  { id: 2, date: "2023-01-02", amount: 100, type: "expense", category: "Groceries" },
  { id: 3, date: "2023-01-03", amount: 200, type: "expense", category: "Bills" },
];

// Mocked data for categories
const categories = ["Salary", "Groceries", "Bills", "Entertainment", "Other"];

// Mocked data for budgets
const initialBudgets = {
  Groceries: 300,
  Bills: 150,
  Entertainment: 100,
  Other: 200,
};

const Index = () => {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [budgets, setBudgets] = useState(initialBudgets);
  const [editingBudget, setEditingBudget] = useState(null);
  const [newBudgetValue, setNewBudgetValue] = useState("");
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const initialRef = useRef();
  const finalRef = useRef();
  const toast = useToast();

  // State for form inputs
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("income");
  const [category, setCategory] = useState(categories[0]);
  const [editingId, setEditingId] = useState(null);

  // Add or edit transaction
  const handleSaveTransaction = () => {
    if (editingId) {
      // Edit transaction
      const updatedTransactions = transactions.map((transaction) => (transaction.id === editingId ? { ...transaction, date, amount: parseFloat(amount), type, category } : transaction));
      setTransactions(updatedTransactions);
      setEditingId(null);
    } else {
      // Add new transaction
      const newTransaction = {
        id: transactions.length + 1,
        date,
        amount: parseFloat(amount),
        type,
        category,
      };
      setTransactions([...transactions, newTransaction]);
    }
    setDate("");
    setAmount("");
    setType("income");
    setCategory(categories[0]);
  };

  // Select transaction to edit
  const handleEditTransaction = (transactionId) => {
    const transaction = transactions.find((t) => t.id === transactionId);
    setDate(transaction.date);
    setAmount(transaction.amount.toString());
    setType(transaction.type);
    setCategory(transaction.category);
    setEditingId(transactionId);
  };

  // Delete transaction
  const handleDeleteTransaction = (transactionId) => {
    const updatedTransactions = transactions.filter((transaction) => transaction.id !== transactionId);
    setTransactions(updatedTransactions);
  };

  // Calculate total balance
  const calculateTotalBalance = () => {
    return transactions.reduce((balance, transaction) => balance + (transaction.type === "income" ? transaction.amount : -transaction.amount), 0);
  };

  // View spending summary
  const getSpendingSummary = () => {
    const summary = { income: 0, expenses: 0, byCategory: {} };
    transactions.forEach((transaction) => {
      if (transaction.type === "income") {
        summary.income += transaction.amount;
      } else {
        summary.expenses += transaction.amount;
        summary.byCategory[transaction.category] = (summary.byCategory[transaction.category] || 0) + transaction.amount;
      }
    });
    return summary;
  };

  // Export transactions to JSON
  const exportTransactions = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(transactions));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "transactions.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Mock function for import transactions - would be replaced with actual file import functionality
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [csvInput, setCsvInput] = useState("");

  const parseCSV = (csv) => {
    const lines = csv.split("\n");
    return lines.map((line) => {
      const [date, amount, type, category] = line.split(",");
      return { id: transactions.length + 1, date, amount: parseFloat(amount), type, category };
    });
  };

  const handleImportTransactions = () => {
    const newTransactions = parseCSV(csvInput);
    setTransactions([...transactions, ...newTransactions]);
    setCsvInput("");
    setIsImportModalOpen(false);
  };

  const openImportModal = () => setIsImportModalOpen(true);
  const closeImportModal = () => setIsImportModalOpen(false);
  const handleCsvInput = (e) => setCsvInput(e.target.value);

  const openBudgetModal = (category) => {
    setEditingBudget(category);
    setNewBudgetValue(budgets[category].toString());
    setIsBudgetModalOpen(true);
  };

  const closeBudgetModal = () => {
    setIsBudgetModalOpen(false);
  };

  const handleBudgetChange = (e) => {
    setNewBudgetValue(e.target.value);
  };

  const saveBudget = () => {
    setBudgets((prevBudgets) => ({
      ...prevBudgets,
      [editingBudget]: parseFloat(newBudgetValue),
    }));
    closeBudgetModal();
  };

  // Add the updated getBudgetStatus function here
  const getBudgetStatus = () => {
    const status = {};
    Object.keys(budgets).forEach((category) => {
      status[category] = {
        budget: budgets[category],
        spent: transactions.filter((transaction) => transaction.type === "expense" && transaction.category === category).reduce((sum, transaction) => sum + transaction.amount, 0),
      };
    });
    return status;
  };

  return (
    <Container maxW="container.xl" py={5}>
      <VStack spacing={5}>
        <Box w="100%">
          <Text fontSize="2xl" fontWeight="bold">
            Financial Tracker
          </Text>
        </Box>

        <Box as="form" w="100%" onSubmit={(e) => e.preventDefault()}>
          <Stack direction={["column", "row"]} spacing={3} align="center">
            <FormControl id="date" isRequired>
              <FormLabel>Date</FormLabel>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </FormControl>
            <FormControl id="amount" isRequired>
              <FormLabel>Amount</FormLabel>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </FormControl>
            <FormControl id="type" isRequired>
              <FormLabel>Type</FormLabel>
              <Select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </Select>
            </FormControl>
            <FormControl id="category" isRequired>
              <FormLabel>Category</FormLabel>
              <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map((cat, index) => (
                  <option key={index} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            </FormControl>
            <Button leftIcon={<FaPlus />} colorScheme="teal" onClick={handleSaveTransaction}>
              {editingId ? "Update" : "Add"} Transaction
            </Button>
          </Stack>
        </Box>

        <Box w="100%">
          <Text fontSize="lg" fontWeight="semibold">
            Transactions
          </Text>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Date</Th>
                <Th>Amount</Th>
                <Th>Type</Th>
                <Th>Category</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {transactions.map((transaction) => (
                <Tr key={transaction.id}>
                  <Td>{transaction.date}</Td>
                  <Td isNumeric>{transaction.amount.toFixed(2)}</Td>
                  <Td>{transaction.type}</Td>
                  <Td>{transaction.category}</Td>
                  <Td>
                    <IconButton aria-label="Edit" icon={<FaEdit />} size="sm" onClick={() => handleEditTransaction(transaction.id)} />
                    <IconButton aria-label="Delete" icon={<FaTrash />} size="sm" ml={2} onClick={() => handleDeleteTransaction(transaction.id)} />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        <Flex justify="space-between" w="100%">
          <Button leftIcon={<FaFileExport />} colorScheme="blue" onClick={exportTransactions}>
            Export Transactions
          </Button>
          <Button leftIcon={<FaFileImport />} colorScheme="orange" onClick={openImportModal}>
            Import Transactions
          </Button>
          <Modal isOpen={isImportModalOpen} onClose={closeImportModal}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Import Transactions</ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6}>
                <FormControl>
                  <FormLabel>Paste CSV data</FormLabel>
                  <Textarea placeholder="Enter CSV data" value={csvInput} onChange={handleCsvInput} />
                </FormControl>
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="blue" mr={3} onClick={handleImportTransactions}>
                  Import
                </Button>
                <Button onClick={closeImportModal}>Cancel</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </Flex>

        <Box w="100%">
          <Text fontSize="lg" fontWeight="semibold">
            Total Balance: ${calculateTotalBalance().toFixed(2)}
          </Text>
        </Box>

        <Box w="100%">
          <Text fontSize="lg" fontWeight="semibold">
            Spending Summary
          </Text>
          <VStack align="start">
            {Object.entries(getSpendingSummary().byCategory).map(([category, amount], index) => (
              <HStack key={index}>
                <Text>{category}:</Text>
                <Text fontWeight="bold">${amount.toFixed(2)}</Text>
              </HStack>
            ))}
          </VStack>
        </Box>

        <Box w="100%">
          <Text fontSize="lg" fontWeight="semibold">
            Budget Status
          </Text>
          <VStack align="start">
            {Object.entries(getBudgetStatus()).map(([category, { budget, spent }]) => (
              <HStack key={category}>
                <Text cursor="pointer" color="blue.500" onClick={() => openBudgetModal(category)}>
                  {category}:
                </Text>
                <Text fontWeight="bold">
                  Spent: ${spent.toFixed(2)} / Budget: ${budget.toFixed(2)}
                </Text>
              </HStack>
            ))}
          </VStack>
        </Box>
      </VStack>
      <Modal isOpen={isBudgetModalOpen} onClose={closeBudgetModal} initialFocusRef={initialRef} finalFocusRef={finalRef}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Budget for {editingBudget}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>Budget Amount</FormLabel>
              <Input ref={initialRef} type="number" value={newBudgetValue} onChange={handleBudgetChange} placeholder="Enter new budget amount" />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={saveBudget}>
              Save
            </Button>
            <Button onClick={closeBudgetModal}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default Index;
