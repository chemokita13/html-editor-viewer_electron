const path = require("path");
//import path from "path";
//import fs from "fs";
const fs = require("fs");

const { app, BrowserWindow, Menu, dialog } = require("electron");
const isDev = require("electron-is-dev");
let win;

const newfile = () =>
    dialog.showOpenDialogSync({
        properties: [
            "openFile",
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
                    const newFilePath = newfile();
                    if (newFilePath) {
                        console.log("sending: " + newFilePath);
                        sendFileContent(newFilePath[0]);
                        console.log("sent: " + newFilePath);
                    }
                },
            },
            {
                label: "Save",
                accelerator: "Ctrl+S",
                click() {
                    //TODO
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
