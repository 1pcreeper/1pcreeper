import type { Speech } from './enums';

export interface WordDTO {
  id: number;
  subtopicId: number;
  subtopicName: string;
  subject: string;
  partOfSpeech: Speech;
  chineseDefinition: string;
  englishDefinition: string;
  exampleSentences: string[];
  createdAt: string;
  updatedAt: string | null;
  createdBy: number | null;
  updatedBy: number | null;
}

export interface WordRequestDTO {
  subtopicId: number;
  subject: string;
  partOfSpeech: Speech;
  chineseDefinition: string;
  englishDefinition: string;
  exampleSentences: string[];
}
