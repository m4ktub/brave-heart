export interface Translator {
  language: string;
  translate(key: string, substitutions: string[]): string;
}

class ChromeI18n implements Translator {

  get language() {
    return chrome.i18n.getUILanguage();
  }

  translate(key: string, substitutions: string[] = []) {
    return chrome.i18n.getMessage(key, substitutions);
  }

}

export const I18n: Translator = new ChromeI18n();
