const { app, BrowserWindow, dialog } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const http = require("http");

let mainWindow = null;
let backendProcess = null;

const BACKEND_PORT = 8000;

function getBackendPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "backend", "dudu_pos.exe");
  }
  // Dev mode: run from project release folder
  return path.join(__dirname, "..", "release", "dudu_pos.exe");
}

function startBackend() {
  return new Promise((resolve, reject) => {
    const exePath = getBackendPath();
    console.log("Starting backend:", exePath);

    try {
      backendProcess = spawn(exePath, [], {
        stdio: "ignore",
        windowsHide: true,
      });

      backendProcess.on("error", (err) => {
        reject(new Error("Failed to start backend: " + err.message));
      });

      backendProcess.on("exit", (code) => {
        if (code !== 0 && code !== null) {
          console.log("Backend exited with code:", code);
        }
      });
    } catch (err) {
      reject(err);
      return;
    }

    // Wait for backend to be ready
    let attempts = 0;
    const maxAttempts = 30;
    const check = () => {
      attempts++;
      http.get("http://localhost:" + BACKEND_PORT + "/api/health", (res) => {
        if (res.statusCode === 200) {
          resolve();
        } else if (attempts < maxAttempts) {
          setTimeout(check, 500);
        } else {
          reject(new Error("Backend not ready after " + maxAttempts + " attempts"));
        }
      }).on("error", () => {
        if (attempts < maxAttempts) {
          setTimeout(check, 500);
        } else {
          reject(new Error("Backend not reachable"));
        }
      });
    };
    setTimeout(check, 1000);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 600,
    title: "嘟嘟 POS 系统",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadURL("http://localhost:" + BACKEND_PORT);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  try {
    await startBackend();
    createWindow();
  } catch (err) {
    dialog.showErrorBox("启动失败", err.message);
    app.quit();
  }
});

app.on("window-all-closed", () => {
  if (backendProcess) {
    backendProcess.kill();
    backendProcess = null;
  }
  app.quit();
});

app.on("before-quit", () => {
  if (backendProcess) {
    backendProcess.kill();
    backendProcess = null;
  }
});