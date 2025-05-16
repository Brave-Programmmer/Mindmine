/**
 * Represents a book in the system
 */
export interface Book {
  /** Unique identifier for the book */
  id: string;
  /** Title of the book */
  title: string;
  /** Author of the book */
  author: string;
  /** Optional URL to the book's cover image */
  coverImage?: string;
  /** Total number of pages in the book */
  totalPages: number;
  /** Genre of the book */
  genre: string;
  /** Synopsis of the book */
  synopsis: string;
  /** When the book was created */
  createdAt: Date;
  /** When the book was last updated */
  updatedAt: Date;
}

/**
 * Represents a chapter within a book
 */
export interface Chapter {
  /** Unique identifier for the chapter */
  id: string;
  /** Title of the chapter */
  title: string;
  /** Order of the chapter within the book */
  order: number;
  /** ID of the book this chapter belongs to */
  bookId: string;
  /** When the chapter was created */
  createdAt: Date;
  /** When the chapter was last updated */
  updatedAt: Date;
}

/**
 * Represents a page within a chapter
 */
export interface BookPage {
  /** Unique identifier for the page */
  id: string;
  /** Content of the page */
  content: string;
  /** Page number within the chapter */
  pageNumber: number;
  /** ID of the chapter this page belongs to */
  chapterId: string;
  /** ID of the book this page belongs to */
  bookId: string;
  /** When the page was created */
  createdAt: Date;
  /** When the page was last updated */
  updatedAt: Date;
}

/**
 * Props for the BookPageEditor component
 */
export interface BookPageEditorProps {
  /** Current content of the page */
  content: string;
  /** Callback when content changes */
  onChange: (content: string) => void;
  /** Page number within the chapter */
  pageNumber: number;
  /** Title of the chapter */
  chapterTitle: string;
  /** Optional callback when saving the page */
  onSave?: () => Promise<void>;
  /** Optional callback when deleting the page */
  onDelete?: () => Promise<void>;
}

/**
 * Props for the BookPageManager component
 */
export interface BookPageManagerProps {
  /** ID of the book being managed */
  bookId: string;
} 