// Tesseract writes routine diagnostics to stderr, which Chrome records as
// extension errors. Keep unexpected diagnostics visible for troubleshooting.
const reportError = console.error.bind(console);
const ignoredParameters = new Set([
  "language_model_ngram_on",
  "segsearch_max_char_wh_ratio",
  "language_model_ngram_space_delimited_language",
  "language_model_use_sigmoidal_certainty",
  "language_model_ngram_nonmatch_score",
  "classify_integer_matcher_multiplier",
  "assume_fixed_pitch_char_segment",
  "allow_blob_division"
]);
console.error = (...args) => {
  if (args.length === 1 && typeof args[0] === "string") {
    const parameter = /^Warning: Parameter not found: ([a-z_]+)$/.exec(args[0]);
    if ((parameter && ignoredParameters.has(parameter[1])) || /^Estimating resolution as \d+$/.test(args[0])) return;
  }
  reportError(...args);
};
importScripts("worker.min.js");
