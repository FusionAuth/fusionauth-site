import { JSONPath } from 'jsonpath-plus';

/**
 * Common cache object used by parsers.
 */
const CACHE: Record<string, any> = {};

/**
 * Available values for the optional syntax prop.
 */
export enum Parser {
  JSON = 'json',
}

/**
 * Custom function to look up the value.
 */
export type SelectorFunction = (element: object) => string;

/**
 * JSON Parser
 *
 * @param {String} url URL used as a key for the caching system
 * @param {String} code Actual code to be parsed
 * @param {String|SelectorFunction} selectorOrFunction A JSONPath selector or a custom function to look up the value.
 */
function jsonParser (url: string, code: string, selectorOrFunction: string | SelectorFunction): unknown {
  // Caching JSON objects
  if (typeof CACHE[url] === 'undefined') {
    try {
      CACHE[url] = JSON.parse(code);
    } catch (err: unknown) {
      return null;
    }
  }

  // Strings are treated as JSONPath selector
  if (typeof selectorOrFunction === 'string') {
    const result = JSONPath({
      path: selectorOrFunction,
      json: CACHE[url],
    });
    return result?.[0] ?? null;
  }

  // If this is a function, we call it passing the JSON object as argument
  return selectorOrFunction(CACHE[url]);
}

/**
 * Parsing content, optionally looking up the value via a selector
 *
 * @param {String} url URL used as a key for the caching system
 * @param {String} content Actual code to be parsed
 * @param {String|SelectorFunction} selector String or a custom function
 * @param {String|Parser|undefined} parser Optional parser (default is to detect from the filename extension)
 */
export default function parse (
  url: string,
  content: string,
  selector: string | SelectorFunction,
  parser?: string | Parser,
): unknown {
  // If no parser was informed, we use the file extension
  if ((parser === undefined) || (parser === '')) {
    const parsedUrl = new URL(url);
    parser = parsedUrl.pathname.substring(parsedUrl.pathname.lastIndexOf('.') + 1);
  }

  switch (parser.toLowerCase()) {
    case Parser.JSON:
      return jsonParser(url, content, selector);
  }

  return null;
}
