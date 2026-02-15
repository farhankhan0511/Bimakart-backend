let ocrDownUntil = 0;
let analysisDownUntil = 0;

export function isOCRDown() {
  return Date.now() < ocrDownUntil;
}

export function isAnalysisDown() {
  return Date.now() < analysisDownUntil;
}

export function markOCRDown() {
  ocrDownUntil = Date.now() + 5 * 60 * 1000;
}

export function markAnalysisDown() {
  analysisDownUntil = Date.now() + 5 * 60 * 1000;
}
