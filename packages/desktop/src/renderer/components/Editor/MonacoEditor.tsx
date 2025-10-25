import { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';

interface MonacoEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  theme?: string;
  readOnly?: boolean;
}

export const MonacoEditor = ({
  value,
  onChange,
  language = 'javascript',
  theme = 'vs-dark',
  readOnly = false,
}: MonacoEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    monacoRef.current = monaco.editor.create(editorRef.current, {
      value,
      language,
      theme,
      readOnly,
      minimap: { enabled: true },
      automaticLayout: true,
      fontSize: 14,
      lineNumbers: 'on',
      roundedSelection: false,
      scrollBeyondLastLine: false,
      wordWrap: 'on',
    });

    monacoRef.current.onDidChangeModelContent(() => {
      if (monacoRef.current) {
        onChange(monacoRef.current.getValue());
      }
    });

    return () => {
      monacoRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (monacoRef.current && value !== monacoRef.current.getValue()) {
      monacoRef.current.setValue(value);
    }
  }, [value]);

  return <div ref={editorRef} style={{ width: '100%', height: '100%' }} />;
};
