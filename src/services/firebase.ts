import { db } from "../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import type { Book, Chapter, BookPage } from "../types/book";

/**
 * Service for handling book-related operations in Firebase
 */
export const bookService = {
  /**
   * Create a new book
   * @param data Book data without id and timestamps
   * @returns Created book with id and timestamps
   */
  async createBook(
    data: Omit<Book, "id" | "createdAt" | "updatedAt">
  ): Promise<Book> {
    const newBook = {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, "books"), newBook);
    return {
      ...newBook,
      id: docRef.id,
      createdAt: newBook.createdAt.toDate(),
      updatedAt: newBook.updatedAt.toDate(),
    } as Book;
  },

  /**
   * Get all books ordered by creation date
   * @returns Array of books
   */
  async getAllBooks(): Promise<Book[]> {
    const booksQuery = query(
      collection(db, "books"),
      orderBy("createdAt", "desc")
    );
    const booksSnapshot = await getDocs(booksQuery);
    return booksSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Book[];
  },

  /**
   * Get a specific book by ID
   * @param bookId ID of the book to retrieve
   * @returns Book data
   * @throws Error if book not found
   */
  async getBook(bookId: string): Promise<Book> {
    const bookDoc = await getDoc(doc(db, "books", bookId));
    if (!bookDoc.exists()) {
      throw new Error("Book not found");
    }
    return {
      id: bookDoc.id,
      ...bookDoc.data(),
      createdAt: bookDoc.data().createdAt?.toDate(),
      updatedAt: bookDoc.data().updatedAt?.toDate(),
    } as Book;
  },

  /**
   * Get all chapters for a book
   * @param bookId ID of the book
   * @returns Array of chapters ordered by their order field
   */
  async getChapters(bookId: string): Promise<Chapter[]> {
    const chaptersQuery = query(
      collection(db, "chapters"),
      where("bookId", "==", bookId),
      orderBy("order", "asc")
    );
    const chaptersSnapshot = await getDocs(chaptersQuery);
    return chaptersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Chapter[];
  },

  /**
   * Get all pages for a chapter
   * @param chapterId ID of the chapter
   * @returns Array of pages ordered by page number
   */
  async getPages(chapterId: string): Promise<BookPage[]> {
    const pagesQuery = query(
      collection(db, "bookPages"),
      where("chapterId", "==", chapterId),
      orderBy("pageNumber", "asc")
    );
    const pagesSnapshot = await getDocs(pagesQuery);
    return pagesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as BookPage[];
  },

  /**
   * Add a new chapter to a book
   * @param bookId ID of the book
   * @param title Chapter title
   * @param order Chapter order in the book
   * @returns Created chapter with id and timestamps
   */
  async addChapter(
    bookId: string,
    title: string,
    order: number
  ): Promise<Chapter> {
    const newChapter = {
      title,
      order,
      bookId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, "chapters"), newChapter);
    return {
      ...newChapter,
      id: docRef.id,
      createdAt: newChapter.createdAt.toDate(),
      updatedAt: newChapter.updatedAt.toDate(),
    } as Chapter;
  },

  /**
   * Add a new page to a chapter
   * @param chapterId ID of the chapter
   * @param bookId ID of the book
   * @param pageNumber Page number in the chapter
   * @returns Created page with id and timestamps
   */
  async addPage(
    chapterId: string,
    bookId: string,
    pageNumber: number
  ): Promise<BookPage> {
    const newPage = {
      content: "",
      pageNumber,
      chapterId,
      bookId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, "bookPages"), newPage);
    return {
      ...newPage,
      id: docRef.id,
      createdAt: newPage.createdAt.toDate(),
      updatedAt: newPage.updatedAt.toDate(),
    } as BookPage;
  },

  /**
   * Update a page's content
   * @param pageId ID of the page to update
   * @param content New content for the page
   */
  async updatePage(pageId: string, content: string): Promise<void> {
    await updateDoc(doc(db, "bookPages", pageId), {
      content,
      updatedAt: Timestamp.now(),
    });
  },

  /**
   * Update the total number of pages in a book
   * @param bookId ID of the book
   * @param totalPages New total number of pages
   */
  async updateBookPages(bookId: string, totalPages: number): Promise<void> {
    await updateDoc(doc(db, "books", bookId), {
      totalPages,
      updatedAt: Timestamp.now(),
    });
  },

  /**
   * Delete a page
   * @param pageId ID of the page to delete
   */
  async deletePage(pageId: string): Promise<void> {
    await deleteDoc(doc(db, "bookPages", pageId));
  },
};
