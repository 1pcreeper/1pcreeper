export const ExerciseDifficulty = {
  EASY: 'EASY',
  MEDIUM: 'MEDIUM',
  HARD: 'HARD',
  ADVANCED: 'ADVANCED',
} as const;
export type ExerciseDifficulty = (typeof ExerciseDifficulty)[keyof typeof ExerciseDifficulty];

export const ExerciseQuestionType = {
  ENGLISH_DEFINITION_MATCH: 'ENGLISH_DEFINITION_MATCH',
  MULTIPLE_CHOICE_C2E: 'MULTIPLE_CHOICE_C2E',
  HANG_MAN: 'HANG_MAN',
  FILL_IN_BLANK: 'FILL_IN_BLANK',
  CHINESE_DICTATION: 'CHINESE_DICTATION',
  ENGLISH_DICTATION: 'ENGLISH_DICTATION',
  DRAW_LINE_MATCH: 'DRAW_LINE_MATCH',
  REARRANGE_SENTENCE: 'REARRANGE_SENTENCE',
} as const;
export type ExerciseQuestionType = (typeof ExerciseQuestionType)[keyof typeof ExerciseQuestionType];

export const Speech = {
  NOUN: 'NOUN',
  PRONOUN: 'PRONOUN',
  VERB: 'VERB',
  ADJECTIVE: 'ADJECTIVE',
  ADVERB: 'ADVERB',
  PREPOSITION: 'PREPOSITION',
  CONJUNCTION: 'CONJUNCTION',
  INTERJECTION: 'INTERJECTION',
} as const;
export type Speech = (typeof Speech)[keyof typeof Speech];

export const AppUserRole = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;
export type AppUserRole = (typeof AppUserRole)[keyof typeof AppUserRole];

export const QUESTION_TYPES_WITH_ANSWER_DATA: ExerciseQuestionType[] = [
  ExerciseQuestionType.DRAW_LINE_MATCH,
  ExerciseQuestionType.REARRANGE_SENTENCE,
];
// Question types using hybrid pattern: both answerWordId and answerData
