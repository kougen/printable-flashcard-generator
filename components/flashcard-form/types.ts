export type Card = {
  word: string;
  image: File | null;
};

export type Page = Card[];

export type GenerateResult = {
  error?: string;
  pdf_words_url?: string;
  pdf_images_url?: string;
};
