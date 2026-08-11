import type { DiagnosticQuestion, DiagnosticResult } from '@/lib/types/database';
import { DiagnosticRepository } from '@/lib/repositories/diagnostic-repository';
import { calculatePercentage, getGenesBand } from '@/lib/constants/scoring';

export class DiagnosticService {
  constructor(private repository: DiagnosticRepository) {}

  async getQuestions(): Promise<DiagnosticQuestion[]> {
    return this.repository.getQuestions();
  }

  // El diagnóstico es POR EMPRESA (§13). `orgId` decide de cuál se lee.
  async getLatestResult(userId: string, orgId?: string | null): Promise<DiagnosticResult | null> {
    const row = await this.repository.getLatestResult(orgId);
    if (!row) return null;

    return {
      score: row.score,
      maxScore: row.max_score,
      breakdown: row.breakdown,
      completedAt: row.created_at,
    };
  }

  async saveResult(userId: string, result: DiagnosticResult, orgId?: string | null): Promise<void> {
    // result.score viene en escala GENES (0-75); la banda se calcula sobre ese score.
    const percentage = calculatePercentage(result.score, result.maxScore);
    const level = getGenesBand(result.score);

    await this.repository.saveResult({
      user_id: userId,
      score: result.score,
      max_score: result.maxScore,
      percentage,
      level,
      breakdown: result.breakdown,
    }, orgId);
  }

  /**
   * Calcula el score total y breakdown a partir de las respuestas del usuario
   */
  static calculateScore(
    questions: DiagnosticQuestion[],
    answers: Record<string, string>
  ): DiagnosticResult {
    let totalScore = 0;
    let totalMaxScore = 0;
    const breakdown: DiagnosticResult['breakdown'] = [];

    for (const question of questions) {
      const selectedValue = answers[question.id];
      const options = question.diagnostic_options || [];

      const maxQuestionScore = Math.max(...options.map(o => o.score), 0);
      const selectedOption = options.find(o => o.value === selectedValue);
      const questionScore = selectedOption?.score ?? 0;

      totalScore += questionScore;
      totalMaxScore += maxQuestionScore;

      breakdown.push({
        label: question.title,
        score: questionScore,
        maxScore: maxQuestionScore,
      });
    }

    return {
      score: totalScore,
      maxScore: totalMaxScore,
      breakdown,
      completedAt: new Date().toISOString(),
    };
  }
}
