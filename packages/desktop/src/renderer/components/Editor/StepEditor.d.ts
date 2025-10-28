export interface TestStep {
    id: string;
    action: string;
    locator?: string;
    value?: string;
    description?: string;
    timeout?: number;
    assertionType?: string;
    enabled?: boolean;
    waitCondition?: string;
    screenshot?: string;
    scrollIntoView?: boolean;
    customProperties?: Record<string, any>;
}
interface StepEditorProps {
    step: TestStep | null;
    onSave: (step: TestStep) => void;
    onCancel: () => void;
    variables?: string[];
}
export declare const StepEditor: ({ step, onSave, onCancel, variables }: StepEditorProps) => import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=StepEditor.d.ts.map