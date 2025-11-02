export interface Photo {
  id: string;
  url: string;
  filename: string;
  description?: string;
  isFavorite?: boolean;
  deleted?: boolean;
}

