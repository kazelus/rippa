import { LucideIcon } from "lucide-react";

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface Download {
  id: string;
  name: string;
  url: string;
  fileType: string;
  fileSize?: number;
  modelId: string;
}
