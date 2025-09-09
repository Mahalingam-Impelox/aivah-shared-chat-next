/* eslint-disable @typescript-eslint/strict-boolean-expressions */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
'use client';

export class SessionStorage {
  /**
   *
   * Used to store data in session storage
   * @param key @type string
   * @param value @type object or string
   * @returns boolean
   */
  public static setItem(key: string, value: object | string): boolean {
    sessionStorage.setItem(key, JSON.stringify(value));
    return true;
  }

  /**
   *
   * Used retrieve value from session storage
   * @param key @type string
   * @returns object or string
   */
  public static getItem(key: string): object | string {
    try {
      return JSON.parse(sessionStorage.getItem(key) ?? '');
    } catch (error) {
      return '';
    }
  }

  /**
   *
   * Used retrieve value from session storage
   * @param key @type string
   * @returns  string
   */
  public static getString(key: string): string {
    try {
      return sessionStorage.getItem(key) ?? '';
    } catch (error) {
      return '';
    }
  }

  /**
   *
   * Used to store data in session storage
   * @param key @type string
   * @param value @type string
   * @returns boolean
   */
  public static setString(key: string, value: string): boolean {
    sessionStorage.setItem(key, value);
    return true;
  }

  /**
   *
   * Used to remove single item from session storage
   * @param key @type string
   * @returns void
   */
  public static clearItem(key: string): void {
    sessionStorage.removeItem(key);
  }

  /**
   *
   * Clear whole session storage.
   * Mostly used when user logout
   */
  public static clear(): void {
    sessionStorage.clear();
  }
}
