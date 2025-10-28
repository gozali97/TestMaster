import React from 'react';
interface ErrorDetail {
    testId: string;
    testName: string;
    status: 'failed' | 'healed';
    duration: number;
    error?: string;
    screenshots?: string[];
    video?: string;
    analysis?: {
        category: 'APP_BUG' | 'TEST_ISSUE' | 'ENVIRONMENT' | 'FLAKY';
        rootCause: string;
        suggestedFix: {
            forDeveloper: string;
            forQA: string;
        };
        confidence: number;
    };
}
interface ErrorDetailModalProps {
    error: ErrorDetail;
    onClose: () => void;
}
export declare const ErrorDetailModal: React.FC<ErrorDetailModalProps>;
export {};
//# sourceMappingURL=ErrorDetailModal.d.ts.map