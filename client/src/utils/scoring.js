import { WEIGHTS, STAGES, BONUS_ITEMS } from './constants';

export function getAdminStatus(adminArray) {
  if (!adminArray || !Array.isArray(adminArray)) return "wait";
  if (adminArray.some(val => val === false)) return "fail";
  if (adminArray.length > 0 && adminArray.every(val => val === true)) return "ok";
  return "wait";
}

export function computeStageScore(scores, weights) {
  if (!scores || !Array.isArray(scores) || scores.some(s => s == null)) {
    return null;
  }
  const weightedSum = scores.reduce((sum, score, idx) => {
    const w = weights[idx] || 0;
    return sum + (score * w) / 100;
  }, 0);
  return weightedSum * 20; // 5 scale normalized to 100
}

export function computeAssessment(assessment) {
  if (!assessment) {
    return {
      adminStatus: "wait",
      stageScores: { porto: null, lapangan: null, final: null },
      bonusTotal: 0,
      finalScore: null,
      predicate: "Belum ada nilai"
    };
  }

  const adminStatus = getAdminStatus(assessment.admin);
  const category = assessment.ident?.kategori || "Individu";
  const weights = WEIGHTS[category] || WEIGHTS.default;

  const stageScores = {};
  STAGES.forEach(({ key }) => {
    stageScores[key] = computeStageScore(assessment.scores?.[key], weights);
  });

  const bonusTotal = (assessment.bonus || []).reduce((sum, isChecked, idx) => {
    return sum + (isChecked ? (BONUS_ITEMS[idx]?.points || 0) : 0);
  }, 0);

  let finalScore = null;
  const allStagesCompleted = STAGES.every(({ key }) => stageScores[key] != null);

  if (adminStatus !== "fail" && allStagesCompleted) {
    const weightedStages = STAGES.reduce((sum, { key, weight }) => {
      return sum + (stageScores[key] * weight) / 100;
    }, 0);
    finalScore = Math.min(100, Math.round((weightedStages + bonusTotal) * 10) / 10);
  }

  let predicate = "Belum ada nilai";
  if (adminStatus === "fail") {
    predicate = "Gugur (Tidak Dinilai)";
  } else if (finalScore != null) {
    if (finalScore >= 85) predicate = "Sangat Layak (Kandidat Juara)";
    else if (finalScore >= 70) predicate = "Layak";
    else if (finalScore >= 55) predicate = "Cukup Layak";
    else predicate = "Belum Layak";
  }

  return {
    adminStatus,
    stageScores,
    bonusTotal,
    finalScore,
    predicate
  };
}

export function formatScore(num) {
  if (num == null || isNaN(num)) return "–";
  return Number(num).toFixed(1).replace(".", ",");
}
