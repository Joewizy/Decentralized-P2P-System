const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    minWidth: 1200,
    height: 700,
    minHeight: 700,
    icon: path.join(__dirname, "icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      nodeIntegration: true,
      contextIsolation: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));

  // if (process.env.NODE_ENV === "production") {
    
  //   mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  // } else {
  //   mainWindow.loadURL("http://localhost:5173");
  // }

  // Handle printing
  ipcMain.handle("print-page", () => printPage());
  ipcMain.handle("print-page-pos", () => printPagePos());
}

// Print the page (A4 size)
function printPage() {
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.print({
        silent: false,  // Show the print dialog
        printBackground: true,  // Include background graphics
        pageSize: 'A4',  // Set a page size (optional)
      });
  
      return { success: true };
    }
  
    return { success: false, message: 'No window available for printing.' };
  }

// Print the page (Thermal POS size)
function printPagePos() {
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.print({
        silent: false,  // Show the print dialog
        printBackground: true,  // Include background graphics
        pageSize: { width: 80 * 2.83, height: 297 * 2.83 },  // Set a page size (optional)
      });
  
      return { success: true };
    }
  
    return { success: false, message: 'No window available for printing.' };
  }

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
