export interface Photo {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  uploadedAt: Date;
}

export interface PhotoUploadData {
  file: File;
  title: string;
  description?: string;
}