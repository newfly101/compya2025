/**
 *   export const 데모이름 = async (`@RequestParam`) => {
 *       return await API.post(`endpoint삽입`, `@RequestParam`).then(({data}) => data);
 *   }
 */
import { API } from "@/store/api/APIConfig.js";
import { DICTIONARY } from "@/store/modules/dictionary/endpoints.js";


export const dictionaryGetSkills = async (item) => {
  return await API.get(DICTIONARY.SKILLSET, item).then(({data}) => data);
}
