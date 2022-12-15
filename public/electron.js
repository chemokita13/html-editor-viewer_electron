const path = require("path");

const fs = require("fs");

const { app, BrowserWindow, Menu, dialog, ipcMain } = require("electron");
const isDev = require("electron-is-dev");
let win, defaultFilePath;

const openFile = () =>
    dialog.showOpenDialogSync({
        properties: [
            "openFile",
            {
                filters: [{ name: "Html file", extensions: ["html"] }],
            },
        ],
    });

const saveFile = () =>
    dialog.showSaveDialogSync({
        properties: [
            // "openFile",
            {
                filters: [{ name: "Html file", extensions: ["html"] }],
            },
        ],
    });

const sendFileContent = (filepath) => {
    const fileContent = fs.readFileSync(filepath, {
        encoding: "utf8",
        flag: "r",
    });
    win.webContents.send("file:open", fileContent);
};

// Menu Template
const templateMenu = [
    {
        label: "File",
        submenu: [
            {
                label: "New File",
                accelerator: "Ctrl+N",
                click() {
                    //createNewProductWindow();
                    main.webContents.openDevTools();
                },
            },
            {
                label: "Open file",
                accelerator: "Ctrl+O",
                click() {
                    const openFilePath = openFile();
                    if (openFilePath) {
                        console.log("sending: " + openFilePath);
                        sendFileContent(openFilePath[0]);
                        defaultFilePath = openFilePath[0];
                        console.log("sent: " + openFilePath);
                    }
                },
            },
            {
                label: "Save as",
                accelerator: "Ctrl+Shift+S",
                click() {
                    //TODO
                    const pathToSave = saveFile();
                    console.log(pathToSave);
                    win.webContents.send("haveToSendData");
                    ipcMain.once("file:data", (event, msg) => {
                        console.log("recived", msg);
                        fs.writeFileSync(pathToSave, msg);
                    });
                    defaultFilePath = pathToSave;
                },
            },
            {
                label: "Save",
                accelerator: "Ctrl+S",
                click() {
                    console.log(defaultFilePath, "OOOOOO");
                    if (defaultFilePath) {
                        win.webContents.send("haveToSendData");
                        ipcMain.once("file:data", (event, msg) => {
                            console.log("recived", msg);
                            fs.writeFileSync(defaultFilePath, msg);
                        });
                    } else {
                        const pathToSave = saveFile();
                        console.log(pathToSave);
                        win.webContents.send("haveToSendData");
                        ipcMain.once("file:data", (event, msg) => {
                            fs.writeFileSync(pathToSave, msg);
                            console.log("recived", msg);
                        });
                        defaultFilePath = pathToSave;
                    }
                },
            },
        ],
    },
];

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    // create menu
    const mainMenu = Menu.buildFromTemplate(templateMenu);
    //add menu
    Menu.setApplicationMenu(mainMenu);

    // and load the index.html of the app.
    // win.loadFile("index.html");
    win.loadURL(
        isDev
            ? "http://localhost:3000"
            : `file://${path.join(__dirname, "../build/index.html")}`
    );
    // Open the DevTools.
    if (isDev) {
        win.webContents.openDevTools({ mode: "detach" });
    }

    win.once("ready-to-show", () => win.show());
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bars to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
