import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
    target?: string | '_self';
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export type FieldType = 'Text' | 'Markup' | 'Image' | 'Link';

export interface Field {
    id: string;
    type: FieldType;
    key: string;
    label: string;
    fields?: Field[];
}

export interface Schema {
    id: string;
    title: string;
    repeatable?: boolean;
    fields: Field[];
    children?: Schema[];
}

export interface SchemaCardProps {
    schema: Schema;
    reorderFields: (schemaId: string, fromIndex: number, toIndex: number) => void;
    reorderChildren: (schemaId: string, oldIndex: number, newIndex: number) => void;
    updateSchemaTitle: (schemaId: string, title: string) => void;
    updateSchemaRepeatable: (schemaId: string, isRepeatable: boolean) => void;
    addSubSchema: (parentId: string) => void;
    removeSchema: (schemaId: string) => void;
    addField: (schemaId: string, type?: FieldType) => void;
    updateField: (schemaId: string, fieldId: string, data: Partial<Field>) => void;
    removeField: (schemaId: string, fieldId: string) => void;
}

export type Folder = {
    id: number;
    name: string;
  };
  
  export type MediaItem = {
    id: string;
    name: string;
    path_id: string;
    folder?: {
      name: string;
    };
    tagNames:string;
  };
  
  export type OptionType = {
    value: string;
    label: string;
  };

  export type ImageTag = {
    id: string;
    tagname: string;
  };
  export interface FolderItem {
  title: string;
  fileCount: number;
  fileSize: string;
}