import api from './api';
import { RegexTeaser } from '../types/regexTeaser';

export async function getRegexes(): Promise<RegexTeaser[]> {
  const { data } = await api.get('regex');
  const regexes: RegexTeaser[] = [];
  for (let i = 0; i < data.response.regexes.length ; i++) {
    regexes.push({id: i, name: data.response.regexes[i]})
  }
  return regexes;
}

export async function addRegex(regexData: { name: string }) {
  const { data } = await api.post<{ readonly id: number; name: string }>('regex');
  return data;
}

export async function editRegex(id: string | number, regexData: { name: string }) {
  const { data } = await api.patch<{ readonly id: number; name: string }>(`regex/${id}`, regexData);
  return data;
}

export async function deleteRegex(id: string | number) {
  const { data } = await api.delete<void>(`regex/${id}`);
  return data;
}

export async function addRegexExample(regexExampleData: { example: string }) {
  const { data } = await api.post<{ example: string }>(`regex/examples`, regexExampleData);
  return data;
}

export async function editRegexExample(id: string | number, regexExampleData: { example: string }) {
  const { data } = await api.patch<{ example: string }>(`regex/examples/${id}`, regexExampleData);
  return data;
}

export async function deleteRegexExample(id: string | number) {
  const { data } = await api.delete<void>(`regex/examples/${id}`);
  return data;
}
