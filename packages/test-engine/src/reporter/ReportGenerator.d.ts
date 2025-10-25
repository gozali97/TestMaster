import { Report, ReportData } from '../autonomous/AutonomousTestingOrchestrator';
/**
 * Report Generator
 *
 * Generates comprehensive test reports:
 * - HTML report with screenshots
 * - JSON data export
 * - PDF report (optional)
 * - Statistics and summaries
 */
export declare class ReportGenerator {
    /**
     * Generate complete report
     */
    generate(data: ReportData): Promise<Report>;
    /**
     * Generate summary statistics
     */
    private generateSummary;
    /**
     * Generate HTML report
     */
    private generateHTML;
    /**
     * Generate JSON report
     */
    private generateJSON;
    /**
     * Format duration
     */
    private formatDuration;
}
//# sourceMappingURL=ReportGenerator.d.ts.map