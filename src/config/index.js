export const sampleTabledata = [
  { name: "john doe", stock: 30, minPrice: 300, maxPrice: 620 },
  { name: "john doe", stock: 30, minPrice: 324, maxPrice: 810 },
  { name: "john doe", stock: 20, minPrice: 546, maxPrice: 893 },
  { name: "john doe", stock: 4, minPrice: 325, maxPrice: 735 },
  { name: "john doe", stock: 321, minPrice: 156, maxPrice: 1000 },
];

export const addInventoryFormControls = [
  {
    name: "title",
    label: "Title",
    placeholder: "Enter product name",
    componentType: "input",
    type: "text",
  },
  {
    name: "costPrice",
    label: "Cost Price",
    placeholder: "Cost Price",
    componentType: "input",
    type: "number",
  },
  {
    name: "minPrice",
    label: "Minimun Selling Price",
    placeholder: "Min",
    componentType: "input",
    type: "number",
  },
  {
    name: "maxPrice",
    label: "Maximum Selling Price",
    placeholder: "Max",
    componentType: "input",
    type: "number",
  },
  {
    name: "totalStock",
    label: "Total Stock",
    placeholder: "Stock",
    componentType: "input",
    type: "number",
  },
];

export const editInventoryFormControls = [
  {
    name: "title",
    label: "Title",
    componentType: "input",
    type: "text",
  },
  {
    name: "costPrice",
    label: "Cost Price",
    componentType: "input",
    type: "number",
  },
  {
    name: "minPrice",
    label: "Minimun Selling Price",
    componentType: "input",
    type: "number",
  },
  {
    name: "maxPrice",
    label: "Maximum Selling Price",
    componentType: "input",
    type: "number",
  },
];

export const addExpenditureFormControls = [
  {
    name: "reason",
    label: "Reason",
    placeholder: "Enter Reason for Expenditure",
    componentType: "textarea",
  },
  {
    name: "name",
    label: "Name",
    placeholder: "Enter your Name",
    componentType: "input",
    type: "text",
  },
  {
    name: "amount",
    label: "Amount",
    placeholder: "Amount taken",
    componentType: "input",
    type: "number",
  },
];

export const addSupplierFormControls = [
  {
    name: "name",
    label: "Name",
    placeholder: "Name of Supplier",
    componentType: "input",
    type: "text",
  },
  {
    name: "phoneno",
    label: "Phone Number",
    placeholder: "Phone Number of Supplier",
    componentType: "input",
    type: "text",
  },
  {
    name: "address",
    label: "Address",
    placeholder: "Address of Supplier",
    componentType: "input",
    type: "text",
  },
];

export const addSupplierLoanFormControls = [
  {
    name: "amount",
    label: "Amount",
    placeholder: "Amount Paid Back",
    componentType: "input",
    type: "text",
  },
];

export const addCustomerFormControls = [
  {
    name: "name",
    label: "Name",
    placeholder: "Name of Customer",
    componentType: "input",
    type: "text",
  },
  {
    name: "phoneno",
    label: "Phone Number",
    placeholder: "Phone Number of Customer",
    componentType: "input",
    type: "text",
  },
  {
    name: "address",
    label: "Address",
    placeholder: "Address of Customer",
    componentType: "input",
    type: "text",
  },
];

export const addCustomerLoanFormControls = [
  {
    name: "amount",
    label: "Amount",
    placeholder: "Amount Paid",
    componentType: "input",
    type: "text",
  },
];

export const addLoanFormControls = [
  {
    name: "amount",
    label: "Amount",
    placeholder: "Amount",
    componentType: "input",
    type: "number",
  },
];
