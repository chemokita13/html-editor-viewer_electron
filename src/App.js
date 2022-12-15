import { useState, useEffect, useRef } from "react";
import Editor, { loader } from "@monaco-editor/react"; // monaco editor react
import * as monaco from "monaco-editor"; // monaco original repo

const { ipcRenderer } = window.require("electron"); // from electronjs docs

function App() {
    const editorRef = useRef(null); // editor ref
    loader.config({ monaco }); // To replace monaco-editor/react cdn's to local files

    const [EditorValue, setEditorValue] = useState(""); // default value

    const setHTMLpart = () => {
        return { __html: EditorValue };
    }; // return value to set in the other <div>

    useEffect(() => {
        const sendContent = () => {
            ipcRenderer.send("file:data", editorRef.current.getValue()); // I can not use EditorValue and i dont know why, but that way is working
            console.log("sended", editorRef.current.getValue());
        };
        ipcRenderer.on("file:open", (event, msg) => setEditorValue(msg));
        ipcRenderer.on("haveToSendData", () => {
            sendContent();
        });

        return () => {
            // To disconect listeners
            ipcRenderer.removeListener("file:open", (event, msg) =>
                setEditorValue(msg)
            );
            ipcRenderer.removeListener("haveToSendData", () => {
                sendContent();
            });
        };
    });

    function handleEditorDidMount(editor) {
        editorRef.current = editor;
    }

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
                    loading={
                        <h1 className="underline">Loading, please wait...</h1> // When editor is loading
                    }
                />
            </div>
            <div dangerouslySetInnerHTML={setHTMLpart()}></div>
        </section>
    );
}

export default App;
