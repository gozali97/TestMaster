import './VariableManager.css';
export interface Variable {
    id: string;
    name: string;
    value: string;
    type: 'string' | 'number' | 'boolean' | 'env';
    description?: string;
}
interface VariableManagerProps {
    variables: Variable[];
    onUpdate: (variables: Variable[]) => void;
    onClose: () => void;
}
export declare const VariableManager: ({ variables, onUpdate, onClose }: VariableManagerProps) => import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=VariableManager.d.ts.map