
import PouchDB from "pouchdb";

const db = new PouchDB("testdb");

const generateId = (prefix) => {
  const now = new Date();
  const date = now
    .toISOString()
    .replace(/[-T:]/g, "")
    .split(".")[0]
    .slice(0, 12);
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);

  return `${prefix}-${date}-${randomSuffix}`;
};

const saveDocument = async (doc) => {
  try {
    const response = await db.put(doc);
    return response;
  } catch (e) {
    console.error("Error saving document:", e);
  }
};

const logActivity = async (category, activity, message) => {
  try {
    await db.put({
      _id: generateId("LOG"),
      type: "logs",
      category,
      activity,
      message,
      timestamp: new Date()
        .toISOString()
        .replace("T", "  ")
        .replace("Z", "  ")
        .slice(0, 19),
    });
  } catch (e) {
    console.error("Error Logging Activity:", e);
  }
};
/////////////////////
/////////////////////
/////Inventory DB////
/////////////////////
/////////////////////
export const addInventory = async (formData, supp) => {
  try {
    const saveDoc = {
      _id: generateId("INV"),
      type: "inventory",
      ...formData,
      supplier: supp || "Nil",
      timestamp: new Date()
      .toISOString()
      .replace("T", "  ")
      .replace("Z", "  ")
      .slice(0, 19),
    };

    await saveDocument(saveDoc);

    await logActivity(
      "Inventory",
      `Added new item: ${formData.title}`,
      `success`
    );

    return true;
  } catch (e) {
    console.error("Error saving doc", e);
  }
};

export const addBulkInventory = async (formData, supp) => {
  try {
    const saveDocs = formData.map((item) => ({
      _id: generateId("INV"),
      type: "inventory",
      ...item,
      supplier: supp || "Nil",
      timestamp: new Date()
      .toISOString()
      .replace("T", "  ")
      .replace("Z", "  ")
      .slice(0, 19),
    }));
    

    await db.bulkDocs(saveDocs);

    await logActivity(
      "Inventory",
      `Added new items: ${formData.length}`,
      `success`
    );

    return true;
  } catch (e) {
    console.error("Error saving docs", e);
  }
};

export const getInventories = async () => {
  try {
    const result = await db.allDocs({
      include_docs: true,
      startkey: "INV",
      endkey: "INV\ufff0",
    });
    return result.rows.map((row) => row.doc);
  } catch (e) {
    console.error("Error getting doc", e);
  }
};

export const updateInventoryItem = async (id, formData) => {
  try {
    const doc = await db.get(id);
    await db.put({
      _id: doc._id,
      _rev: doc._rev,
      ...formData,
      timestamp: new Date()
      .toISOString()
      .replace("T", "  ")
      .replace("Z", "  ")
      .slice(0, 19),
    });

    await logActivity(
      "Inventory",
      `Updated item: ${formData.title}`,
      "Success"
    );

    return true;
  } catch (e) {
    console.error("Error updating doc", e);
  }
};

export const deleteInventoryItem = async (docId) => {
  try {
    const doc = await db.get(docId);
    doc._deleted = true;
    await db.put(doc);

    await logActivity("Inventory", `Deleted item`, "Success");
    return true;
  } catch (e) {
    console.error("Error deleting doc", e);
  }
};

/////////////////////
/////Sales DB/////////
/////////////////////
export const addSales = async (formData) => {
  try {
    const saveDoc = {
      _id: generateId("SAL"),
      type: "sales",
      ...formData,
      timestamp: new Date()
      .toISOString()
      .replace("T", "  ")
      .replace("Z", "  ")
      .slice(0, 19),
    };

    await saveDocument(saveDoc);

    await logActivity(
      "Sales",
      `Made a sale of: ${formData.amount}`,
      `success`
    );

    const result = {
      id: saveDoc._id,
      success: true
    }

    return result;
  } catch (e) {
    console.error("Error saving doc", e);
  }
};

export const getSales = async () => {
  try {
    const result = await db.allDocs({
      include_docs: true,
      startkey: "SAL",
      endkey: "SAL\ufff0",
    });
    return result.rows.map((row) => row.doc);
  } catch (e) {
    console.error("Error getting doc", e);
  }
};

/////////////////////
/////Receipts DB/////
/////////////////////
export const addReceipt = async (formData) => {
  try {
    const saveDoc = {
      _id: generateId("REC"),
      type: "receipts",
      ...formData,
      printed: false,
      timestamp: new Date()
      .toISOString()
      .replace("T", "  ")
      .replace("Z", "  ")
      .slice(0, 19),
    };

    await saveDocument(saveDoc);

    await logActivity(
      "Receipt",
      `Generated receipt: ${formData.title}`,
      `success`
    );

    const result = {
      id: saveDoc._id,
      date: saveDoc.timestamp,
      success: true
    }

    return result;
  } catch (e) {
    console.error("Error saving doc", e);
  }
};

export const updateReceiptPrintStatus = async (id) => {
  try {
    const doc = await db.get(id);
    await db.put({
      _id: doc._id,
      _rev: doc._rev,
      type: doc.type,
      SalesID: doc.SalesID,
      order: doc.order,
      printed: true,
      timestamp: new Date()
      .toISOString()
      .replace("T", "  ")
      .replace("Z", "  ")
      .slice(0, 19),
    });

    await logActivity(
      "Receipts",
      `Printed receipt: ${doc._id}`,
      "Success"
    );

    return true;
  } catch (e) {
    console.error("Error updating doc", e);
  }
};

export const getReceipts = async () => {
  try {
    const result = await db.allDocs({
      include_docs: true,
      startkey: "REC",
      endkey: "REC\ufff0",
    });
    return result.rows.map((row) => row.doc);
  } catch (e) {
    console.error("Error getting doc", e);
  }
};
/////////////////////
///Expenditure DB////
/////////////////////
export const addExpenditure = async (formData) => {
  try {
    const saveDoc = {
      _id: generateId("EXP"),
      type: "expenditures",
      ...formData,
      timestamp: new Date()
      .toISOString()
      .replace("T", "  ")
      .replace("Z", "  ")
      .slice(0, 19),
    };

    await saveDocument(saveDoc);

    await logActivity(
      "Expenditure",
      `Money taken by: ${formData.name}`,
      `Amount: ${formData.amount}`
    );

    return true;
  } catch (e) {
    console.error("Error saving doc", e);
  }
};

export const getExpenditures = async (formData) => {
  try {
    const result = await db.allDocs({
      include_docs: true,
      startkey: "EXP",
      endkey: "EXP\ufff0",
    });
    return result.rows.map((row) => row.doc);
  } catch (e) {
    console.error("Error getting doc", e);
  }
};

/////////////////////
/////Reports DB//////
/////////////////////
export const getReports = async (formData) => {
  try {
    const query = await db.allDocs({
      include_docs: true,
      descending: true,
    });
    const result = query.rows
      .map((row) => row.doc)
      .filter((doc) => doc.type === "sales" || doc.type === "expenditures");
    return result;
  } catch (e) {
    console.error("Error getting doc", e);
  }
};

/////////////////////
/////Suppliers DB////
/////////////////////
export const addSupplier = async (formData) => {
  try {
    const saveDoc = {
      _id: generateId("SUP"),
      type: "supplier",
      ...formData,
      loan: 0,
      timestamp: new Date()
      .toISOString()
      .replace("T", "  ")
      .replace("Z", "  ")
      .slice(0, 19),
    };

    await saveDocument(saveDoc);

    await logActivity(
      "Supplier",
      `Supplier created: ${formData.name}`,
      `success`
    );

    return true;
  } catch (e) {
    console.error("Error saving doc", e);
  }
};

export const updateSupplier = async (id, formData) => {
  try {
    const doc = await db.get(id);
    await db.put({
      _id: doc._id,
      _rev: doc._rev,
      ...formData,
      timestamp: new Date()
      .toISOString()
      .replace("T", "  ")
      .replace("Z", "  ")
      .slice(0, 19),
    });

    await logActivity(
      "Supplier",
      `Updated supplier info: ${formData.name}`,
      "Success"
    );

    return true;
  } catch (e) {
    console.error("Error updating doc", e);
  }
};

export const getSuppliers = async () => {
  try {
    const result = await db.allDocs({
      include_docs: true,
      startkey: "SUP",
      endkey: "SUP\ufff0",
    });
    return result.rows.map((row) => row.doc);
  } catch (e) {
    console.error("Error getting doc", e);
  }
};

export const getSupplierStockData = async () => {
  try {
    const result = await db.allDocs({
      include_docs: true,
      startkey: "SUP",
      endkey: "SUP\ufff0",
    });
    return result.rows.map((row) => row.doc);
  } catch (e) {
    console.error("Error getting doc", e);
  }
};

export const getSupplierLoanData = async () => {
  try {
    const result = await db.allDocs({
      include_docs: true,
      startkey: "SUPL",
      endkey: "SUPL\ufff0",
    });
    return result.rows.map((row) => row.doc);
  } catch (e) {
    console.error("Error getting doc", e);
  }
};

export const addSupplieLoanData = async (docId, formData) => {
  try {
    const saveDoc = {
      _id: generateId("SUPL"),
      type: "supplier loan",
      ...formData,
      timestamp: new Date()
      .toISOString()
      .replace("T", "  ")
      .replace("Z", "  ")
      .slice(0, 19),
    };

    const doc = await db.get(docId);

    const newLoan = Number(doc.loan) - Number(formData.amount);

    if (newLoan < 0) {
      throw new Error("Payment amount cannot exceed outstanding loan.");
    }

    await db.put({
      _id: doc._id,
      _rev: doc._rev,
      loan: newLoan,
      timestamp: new Date()
      .toISOString()
      .replace("T", "  ")
      .replace("Z", "  ")
      .slice(0, 19),
    });

    await saveDocument(saveDoc);

    await logActivity(
      "Supplier",
      `Supplier loan: ${doc.name || "Unknown"} `,
      `Supplier paid loan CAF${formData.amount} of CAF${doc.loan}, remaining loan: CAF${newLoan}`
    );

    return true;
  } catch (e) {
    console.error("Error saving doc", e);
    return false; 
  }
};

export const addSupplierStock = async (docId, formData) => {
  try {
    const doc = await db.get(docId);
    await db.put({
      _id: doc._id,
      _rev: doc._rev,
      ...formData,
      timestamp: new Date()
      .toISOString()
      .replace("T", "  ")
      .replace("Z", "  ")
      .slice(0, 19),
    });

    await logActivity("Supplier", `Stock from: ${formData.title}`, ``);

    return true;
  } catch (e) {
    console.error("Error saving doc", e);
  }
};


/////////////////////
/////Customers DB////
/////////////////////
export const addCustomer = async (formData) => {
  try {
    const saveDoc = {
      _id: generateId("CUS"),
      type: "customer",
      ...formData,
      loan: 0,
      timestamp: new Date()
      .toISOString()
      .replace("T", "  ")
      .replace("Z", "  ")
      .slice(0, 19),
    };

    await saveDocument(saveDoc);

    await logActivity(
      "Customer",
      `Customer created: ${formData.name}`,
      `success`
    );

    return true;
  } catch (e) {
    console.error("Error saving doc", e);
  }
};

export const updateCustomer = async (id, formData) => {
  try {
    const doc = await db.get(id);
    await db.put({
      _id: doc._id,
      _rev: doc._rev,
      ...formData,
      timestamp: new Date()
      .toISOString()
      .replace("T", "  ")
      .replace("Z", "  ")
      .slice(0, 19),
    });

    await logActivity(
      "Customer",
      `Updated customer info: ${formData.name}`,
      "Success"
    );

    return true;
  } catch (e) {
    console.error("Error updating doc", e);
  }
};

export const getCustomers = async () => {
  try {
    const result = await db.allDocs({
      include_docs: true,
      startkey: "CUS",
      endkey: "CUS\ufff0",
    });
    return result.rows.map((row) => row.doc);
  } catch (e) {
    console.error("Error getting doc", e);
  }
};

export const getCustomerOrderData = async () => {
  try {
    const result = await db.allDocs({
      include_docs: true,
      startkey: "CUS",
      endkey: "CUS\ufff0",
    });
    return result.rows.map((row) => row.doc);
  } catch (e) {
    console.error("Error getting doc", e);
  }
};

export const getCustomerLoanData = async () => {
  try {
    const result = await db.allDocs({
      include_docs: true,
      startkey: "CUSL",
      endkey: "CUSL\ufff0",
    });
    return result.rows.map((row) => row.doc);
  } catch (e) {
    console.error("Error getting doc", e);
  }
};

export const addCustomerLoanData = async (docId, formData) => {
  try {
    const saveDoc = {
      _id: generateId("CUSL"),
      type: "customer loan",
      ...formData,
      timestamp: new Date()
      .toISOString()
      .replace("T", "  ")
      .replace("Z", "  ")
      .slice(0, 19),
    };

    const doc = await db.get(docId);

    const newLoan = Number(doc.loan) - Number(formData.amount);

    if (newLoan < 0) {
      throw new Error("Payment amount cannot exceed outstanding loan.");
    }

    await db.put({
      _id: doc._id,
      _rev: doc._rev,
      loan: newLoan,
      timestamp: new Date()
      .toISOString()
      .replace("T", "  ")
      .replace("Z", "  ")
      .slice(0, 19),
    });

    await saveDocument(saveDoc);

    await logActivity(
      "Customer",
      `Customer loan: ${doc.name || "Unknown"} `,
      `Customer paid loan CAF${formData.amount} of CAF${doc.loan}, remaining loan: CAF${newLoan}`
    );

    return true;
  } catch (e) {
    console.error("Error saving doc", e);
    return false; 
  }
};


export const addCustomerPurchase = async (docId, formData) => {
  try {
    const doc = await db.get(docId);
    await db.put({
      _id: doc._id,
      _rev: doc._rev,
      ...formData,
      timestamp: new Date()
      .toISOString()
      .replace("T", "  ")
      .replace("Z", "  ")
      .slice(0, 19),
    });

    await logActivity("Customer", `Purchase from: ${formData.title}`, ``);

    return true;
  } catch (e) {
    console.error("Error saving doc", e);
  }
};


/////////////////////
/////Logs DB/////////
/////////////////////
export const getLogs = async () => {
  try {
    const result = await db.allDocs({
      include_docs: true,
      startkey: "LOG",
      endkey: "LOG\ufff0",
    });
    return result.rows.map((row) => row.doc);
  } catch (e) {
    console.error("Error getting doc", e);
  }
};

/////////////////////
/////Sync DB/////////
/////////////////////
export const syncWithCouchDB = async () => {
  try {
    const remoteDb = new PouchDB("https://e4glogistics.com/db");

    db.sync(remoteDb, {
      live: true,
      retry: true,
    })
      .on("change", (info) => {
        console.log("Sync change:", info);
      })
      .on("paused", (err) => {
        if (err) {
          console.log("Sync paused due to error:", err);
        }
      })
      .on("active", () => {
        console.log("Sync resumed");
      })
      .on("denied", (err) => {
        console.log("Sync denied:", err);
      })
      .on("complete", (info) => {
        console.log("Sync completed", info);
      })
      .on("error", (err) => {
        console.log("Sync error", err);
      });
  } catch (e) {
    console.error("Error syncing db", e);
  }
};

/////////////////////
/////Destroy DB//////
/////////////////////
export const destroyDB = async () => {
  await db
    .destroy()
    .then(() => {
      console.log("Database deleted");
    })
    .catch((err) => {
      console.error("Error deleting DB:", err);
    });
};
