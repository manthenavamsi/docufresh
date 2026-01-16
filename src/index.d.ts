/**
 * DocuFresh - Keep your documents fresh, automatically
 * TypeScript Declaration File
 */

/**
 * Custom data object for variable replacement
 */
export interface CustomData {
  [key: string]: string | number | boolean;
}

/**
 * Marker function signature
 */
export type MarkerFunction = (...args: string[]) => string;

/**
 * DocuFresh class for processing text with dynamic markers
 */
export declare class DocuFresh {
  /**
   * Creates a new DocuFresh instance
   */
  constructor();

  /**
   * Process text and replace all {{markers}} with their values
   * @param text - Text containing {{markers}} to replace
   * @param customData - Optional custom data for variable replacement
   * @returns Processed text with markers replaced
   * @example
   * docufresh.process('Copyright {{current_year}}');
   * // Returns: "Copyright 2026"
   *
   * docufresh.process('Hello {{name}}!', { name: 'World' });
   * // Returns: "Hello World!"
   */
  process(text: string, customData?: CustomData): string;

  /**
   * Register a custom marker function
   * @param name - Marker name (used as {{name}} or {{name:param}})
   * @param fn - Function that returns a string, receives parameters after :
   * @example
   * docufresh.registerMarker('double', (num) => (parseInt(num) * 2).toString());
   * docufresh.process('{{double:5}}'); // Returns: "10"
   */
  registerMarker(name: string, fn: MarkerFunction): void;

  /**
   * Auto-update all markers in the DOM (browser only)
   * @param selector - CSS selector (default: 'body')
   * @param customData - Optional custom data for variable replacement
   * @example
   * // In browser:
   * DocuFresh.autoUpdate('#footer', { company: 'Acme Inc' });
   */
  autoUpdate(selector?: string, customData?: CustomData): void;
}

/**
 * Default DocuFresh instance (singleton)
 */
declare const docufresh: DocuFresh;

export default docufresh;
