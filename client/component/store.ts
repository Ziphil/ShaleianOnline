//

import {
  action,
  observable
} from "mobx";
import {
  LANGUAGES
} from "/client/language";


export class GlobalStore {

  @observable
  public locale: string = "";

  @observable
  public messages: Record<string, string> = {};

  @action
  public async changeLocale(locale: string): Promise<void> {
    const language = LANGUAGES.find((language) => language.locale === locale) ?? LANGUAGES[0];
    this.locale = locale;
    this.messages = language.messages;
    localStorage.setItem("locale", locale);
  }

  @action
  public async defaultLocale(): Promise<void> {
    const locale = localStorage.getItem("locale") ?? "ja";
    this.changeLocale(locale);
  }

}