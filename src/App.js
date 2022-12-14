import "./App.css"; // styles
import { useState } from "react";
import Editor, { loader } from "@monaco-editor/react"; // monaco editor react
import * as monaco from "monaco-editor"; // monaco original repo

///const { ipcRenderer } = window.require('electron') // from electronjs docs
//import {ipcRenderer} from 'electron'

function App() {
    loader.config({ monaco }); // To replace monaco-editor/react cdn's to local files

    const [EditorValue, setEditorValue] = useState(""); // default value

    const setHTMLpart = () => {
        return { __html: EditorValue };
    }; // return value

    ///ipcRenderer.on('file:open', (event, msg) => setEditorValue(msg))

    return (
        <section className="content">
            <div className="editor-part">
                <Editor
                    height="100%"
                    theme="vs-dark"
                    language="html"
                    value={EditorValue}
                    onChange={(newValue) => {
                        setEditorValue(newValue);
                    }}
                    className="editor"
                />
            </div>
            <div
                className="renderer"
                dangerouslySetInnerHTML={setHTMLpart()}
            ></div>
        </section>
    );
}

export default App;
