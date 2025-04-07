import {bundledLanguages, getSingletonHighlighter, Highlighter} from "shiki/bundle/full";

let cachedHighlighter: Promise<Highlighter> | undefined = undefined;
const cachedLoadedLanguages = new Map<string, Promise<void>>();

/**
 * Configuration for the highlighter.
 */
const HIGHLIGHTER_CONFIG = {
  themes: ["github-dark"],
  langs: [],
};

/**
 * Retrieves a cached instance of the Highlighter. If the Highlighter is not already cached,
 * it initializes and caches a new Highlighter instance using the predefined configuration.
 *
 * @return {Promise<Highlighter>} A promise that resolves to the cached Highlighter instance.
 */
export async function getCachedHighlighter(): Promise<Highlighter> {
  if (cachedHighlighter) await cachedHighlighter;

  cachedHighlighter = getSingletonHighlighter(HIGHLIGHTER_CONFIG);
  return await cachedHighlighter;
}

/**
 * Ensures that a specific language is loaded in the provided highlighter instance.
 * If the language is already loaded or unavailable as a bundled language, the method resolves immediately.
 * Otherwise, it loads the language using the highlighter and caches the loading promise.
 *
 * @param {Highlighter} highlighter - The highlighter instance responsible for managing and applying syntax highlighting.
 * @param {string} language - The identifier of the language to ensure is loaded.
 * @param {unknown} data - Any data relevant for logging or debugging purposes.
 * @return {Promise<void>} - A promise that resolves once the specified language is confirmed to be loaded.
 */
export function ensureLanguageIsLoaded(highlighter: Highlighter, language: string, data: unknown): Promise<void> {
  const cachedPromise = cachedLoadedLanguages.get(language);
  if (cachedPromise) {
    return cachedPromise;
  }

  const isLanguageAlreadyLoaded = highlighter.getLoadedLanguages().includes(language);
  const isBundledLanguage = Object.keys(bundledLanguages).includes(language);

  if (!isBundledLanguage) {
    console.warn(`[Shiki] Language "${language}" is not a bundled language, will fallback to "plaintext". ${JSON.stringify(data)}`);
  }

  const loadPromise = isLanguageAlreadyLoaded || !isBundledLanguage
    ? Promise.resolve() : highlighter.loadLanguage(bundledLanguages[language]);
  cachedLoadedLanguages.set(language, loadPromise);
  return loadPromise;
}

/**
 * Resolves the provided language to a supported language if available; otherwise defaults to "plaintext".
 *
 * @param {string} language - The language identifier to be resolved.
 * @return {string} The resolved language if it exists in the bundled languages, or "plaintext" as a fallback.
 */
export function resolveLanguage(language: string): string {
  return bundledLanguages[language] ? language : "plaintext";
}
