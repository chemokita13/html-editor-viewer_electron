//?import "./App.css"; // styles
import { useState, useEffect, useRef } from "react";
import Editor, { loader } from "@monaco-editor/react"; // monaco editor react
import * as monaco from "monaco-editor"; // monaco original repo

const { ipcRenderer } = window.require("electron"); // from electronjs docs
//import { ipcRenderer } from "electron";

function App() {
    const editorRef = useRef(null);
    loader.config({ monaco }); // To replace monaco-editor/react cdn's to local files

    const [EditorValue, setEditorValue] = useState(""); // default value

    const setHTMLpart = () => {
        return { __html: EditorValue };
    }; // return value

    useEffect(() => {
        const sendContent = () => {
            ipcRenderer.send("file:data", editorRef.current.getValue());
            console.log("sended", editorRef.current.getValue());
        };
        ipcRenderer.on("file:open", (event, msg) => setEditorValue(msg));
        ipcRenderer.on("haveToSendData", (event) => {
            sendContent();
        });

        return () => {
            ipcRenderer.removeListener("file:open", (event, msg) =>
                setEditorValue(msg)
            );
            ipcRenderer.removeListener("haveToSendData", (event) => {
                sendContent();
            });
        };
    });

    function handleEditorDidMount(editor, monaco) {
        editorRef.current = editor;
    }

    ///ipcRenderer.on('file:open', (event, msg) => setEditorValue(msg))

    return (
        <section className="grid grid-cols-2 h-screen">
            <div onDrop={(e) => console.log(e.dataTransfer.files[0].path)}>
                <Editor
                    height="100%"
                    theme="vs-dark"
                    language="html"
                    value={EditorValue}
                    onChange={(newValue) => {
                        setEditorValue(newValue);
                    }}
                    className="editor"
                    onMount={handleEditorDidMount}
                    loading={<h1>EDITOR LOADING</h1>}
                />
            </div>
            <div dangerouslySetInnerHTML={setHTMLpart()}></div>
        </section>
    );
}

export default App;
