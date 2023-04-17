import api from './api';
import { Entity } from '../types/entity';

export async function getEntities(): Promise<Entity[]> {
  const { data } = await api.get('entities');
  const entities: Entity[] = [];
  for (let i = 0; i < data.response.entities.length ; i++) {
    entities.push({id: i, name: data.response.entities[i], relatedIntents: []})
  }
  return entities;
}

export async function addEntity(entityData: { name: string }) {
  const { data } = await api.post('rasa/entities/add', entityData);
  return data;
}

export async function editEntity(id: string | number, entityData: { name: string }) {
  const { data } = await api.patch<Entity>(`entities/${id}`, entityData);
  return data;
}

export async function deleteEntity(id: string | number) {
  const { data } = await api.delete<void>(`entities/${id}`);
  return data;
}
