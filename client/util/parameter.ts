//

import {
  NormalParameter,
  Parameter,
  WORD_MODES,
  WORD_TYPES,
  WordMode,
  WordType
} from "soxsot";


export class ParameterUtils {

  public static deserialize(query: Record<string, unknown>, language: string): Parameter {
    const search = (typeof query.search === "string") ? query.search : "";
    const mode = (typeof query.mode === "string") ? ParameterUtils.castMode(query.mode) : "both";
    const type = (typeof query.type === "string") ? ParameterUtils.castType(query.type) : "prefix";
    const ignoreDiacritic = query.ignoreDiacritic !== "false";
    const ignoreOptions = {case: false, diacritic: ignoreDiacritic, space: true, wave: true};
    const parameter = new NormalParameter(search, mode, type, language, ignoreOptions);
    return parameter;
  }

  public static serialize(parameter: Parameter): Record<string, unknown> {
    if (parameter instanceof NormalParameter) {
      const query = {search: parameter.text, mode: parameter.mode, type: parameter.type, ignoreDiacritic: parameter.ignoreOptions.diacritic};
      return query;
    } else {
      return {};
    }
  }

  public static getNormal(parameter: Parameter): NormalParameter {
    const language = parameter.language;
    if (parameter instanceof NormalParameter) {
      return parameter;
    } else {
      return NormalParameter.createEmpty(language);
    }
  }

  private static castMode(rawMode: string): WordMode {
    const anyRawMode = rawMode as any;
    if (WORD_MODES.includes(anyRawMode)) {
      return anyRawMode as WordMode;
    } else {
      return "both";
    }
  }

  private static castType(rawType: string): WordType {
    const anyRawType = rawType as any;
    if (WORD_TYPES.includes(anyRawType)) {
      return anyRawType as WordType;
    } else {
      return "prefix";
    }
  }

}