import React, { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  addDoc,
  serverTimestamp,
  updateDoc,
  getDocs,
  orderBy,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
// (removed duplicate import of doc, updateDoc)
import { db, storage } from "../../firebase";
import { TextCrafter } from "../TextCrafter";
import { useAuthStore } from "../../store/authStore";
import { useNotification } from "../Notification";
import { NotificationProvider } from "../Notification";
// TODO: This file is very large. Consider splitting modal, chapter list, and info card into separate components for maintainability.

// --- MAINTAINER NOTES ---
// This file is large and handles many UI responsibilities.
// Suggestions:
// 1. Split into smaller components: Modal, ChapterList, BookInfoCard, etc.
// 2. Consider using a router for navigation instead of window.location.href.
// 3. The Book.totalChapters property in Firestore is not updated when chapters are added/deleted; consider updating it for consistency.
// 4. Add more robust error handling and user feedback for async operations.
// 5. For large datasets, consider pagination or lazy loading.
// ------------------------

type Book = {
  id: string;
  title: string;
  author: string;
  genre: string;
  synopsis: string;
  coverImage: string;
  totalChapters: number;
  createdAt: string | number;
  email: string;
  images?: string[]; // Add images property for imgbb links
};

type Chapter = {
  id: string;
  title: string;
  content: string;
  createdAt?: { seconds: number } | string | number;
};

const BooksComponent = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [newChapterContent, setNewChapterContent] = useState("");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [creatingChapter, setCreatingChapter] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingChapter, setSavingChapter] = useState(false);

  const [editingBook, setEditingBook] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedGenre, setEditedGenre] = useState("");
  const [savingBook, setSavingBook] = useState(false);
  const [showNewChapterModal, setShowNewChapterModal] = useState(false);

  const [visibleChapters, setVisibleChapters] = useState<Chapter[]>([]);
  const [chaptersPage, setChaptersPage] = useState(1);
  const CHAPTERS_PER_PAGE = 5;
  const [hasMoreChapters, setHasMoreChapters] = useState(false);

  const userEmail = useAuthStore((state) => state.email);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { addNotification } = useNotification();

  // Optimized image upload to Firebase Storage
  const uploadImageToStorage = async (file: File): Promise<string> => {
    if (!selectedBook) throw new Error("No book selected");
    setUploadingImage(true);
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(
        storage,
        `chapter-images/${selectedBook.id}/${fileName}`
      );
      const snapshot = await uploadBytes(storageRef, file);
      return await getDownloadURL(snapshot.ref);
    } catch (error) {
      addNotification({
        type: "error",
        title: "Upload Failed",
        message: "Failed to upload image. Please try again.",
      });
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  // Upload image to imgbb and store link in Firestore (optimized)
  const handleImageUpload = async (file: File): Promise<string> => {
    if (!selectedBook) throw new Error("No book selected");
    setUploadingImage(true);
    try {
      // Upload to imgbb (API key must be provided via env variable)
      const formData = new FormData();
      const apiKey =
        import.meta.env?.PUBLIC_IMGBB_API_KEY ||
        process.env?.PUBLIC_IMGBB_API_KEY;
      if (!apiKey) {
        addNotification({
          type: "error",
          title: "Configuration Error",
          message:
            "Image upload is not configured. Please set PUBLIC_IMGBB_API_KEY.",
        });
        throw new Error("IMGBB API key missing");
      }
      formData.append("image", file);
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!data.success)
        throw new Error(
          data.error?.message || "Failed to upload image to imgbb"
        );
      const imageUrl = data.data.url;
      // Store the image URL in Firestore
      const bookDocRef = doc(db, "books", selectedBook.id);
      await updateDoc(bookDocRef, {
        images: Array.isArray(selectedBook.images)
          ? [...selectedBook.images, imageUrl]
          : [imageUrl],
      });
      addNotification({
        type: "success",
        title: "Image Uploaded",
        message: "Image uploaded successfully!",
      });
      return imageUrl;
    } catch (error) {
      addNotification({
        type: "error",
        title: "Upload Failed",
        message: "Failed to upload image. Please try again.",
      });
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  // Enhanced content save with image processing
  const handleContentChange = (content: string) => {
    setNewChapterContent(content);
  };

  // Enhanced chapter creation with image processing
  const handleCreateChapter = async (e?: React.FormEvent) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    if (!selectedBook) {
      addNotification({
        type: "error",
        title: "No Book Selected",
        message: "Please select a book before creating a chapter.",
      });
      return;
    }
    if (!newChapterTitle.trim()) {
      addNotification({
        type: "error",
        title: "Validation Error",
        message: "Please enter a chapter title.",
      });
      return;
    }
    if (!newChapterContent.trim()) {
      addNotification({
        type: "error",
        title: "Validation Error",
        message: "Chapter content cannot be empty.",
      });
      return;
    }

    setCreatingChapter(true);
    try {
      // Process content to replace local image URLs with Firebase Storage URLs
      let processedContent = newChapterContent;

      // Find and replace local blob URLs with Firebase Storage URLs
      const imageRegex = /!\[([^\]]*)\]\(blob:([^)]+)\)/g;
      const matches = [...processedContent.matchAll(imageRegex)];

      for (const match of matches) {
        try {
          // Convert blob URL to file and upload
          const response = await fetch(match[2]);
          const blob = await response.blob();
          const file = new File([blob], `image_${Date.now()}.png`, {
            type: blob.type,
          });
          const firebaseUrl = await uploadImageToStorage(file);

          // Replace the blob URL with Firebase URL
          processedContent = processedContent.replace(match[2], firebaseUrl);
        } catch (error) {
          console.error("Error processing image:", error);
        }
      }

      const chaptersRef = collection(db, "books", selectedBook.id, "chapters");
      await addDoc(chaptersRef, {
        title: newChapterTitle.trim(),
        content: processedContent,
        createdAt: serverTimestamp(),
      });

      setNewChapterTitle("");
      setNewChapterContent("");
      await loadChapters(selectedBook.id);
      addNotification({
        type: "success",
        title: "Chapter Created",
        message: "Chapter created successfully!",
      });
      closeNewChapterModal();
    } catch (err) {
      console.error("Error creating chapter:", err);
      addNotification({
        type: "error",
        title: "Creation Failed",
        message: "Failed to create chapter. Please try again.",
      });
    } finally {
      setCreatingChapter(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !userEmail) {
      setBooks([]);
      setLoading(false);
      window.location.href = "/login";
      return;
    }

    // Only listen to user's books
    if (!userEmail) return;
    const q = query(collection(db, "books"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const userBooks = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() } as Book))
          .filter((book) => book.email === userEmail);
        setBooks((prev) => {
          // Only update if changed
          if (
            JSON.stringify(prev.map((b) => b.id)) !==
            JSON.stringify(userBooks.map((b) => b.id))
          ) {
            return userBooks;
          }
          return prev;
        });
        setLoading(false);
      },
      (err) => {
        setError("Failed to load books.");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [userEmail, isAuthenticated]);

  // Helper to get timestamp in seconds from createdAt
  function getTimestampSeconds(createdAt: Chapter["createdAt"]): number {
    if (typeof createdAt === "object" && createdAt && "seconds" in createdAt) {
      return createdAt.seconds;
    } else if (typeof createdAt === "number") {
      // If it's already a number, assume it's seconds
      return createdAt;
    } else if (typeof createdAt === "string") {
      return Math.floor(new Date(createdAt).getTime() / 1000);
    }
    return 0;
  }

  const loadChapters = async (bookId: string) => {
    try {
      const chaptersRef = collection(db, "books", bookId, "chapters");
      const q = query(chaptersRef, orderBy("createdAt", "asc"));
      const snapshot = await getDocs(q);
      let chaptersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Chapter[];
      setChapters(chaptersData);
    } catch (err) {
      setChapters([]);
      setError("Failed to load chapters.");
      console.error("Error loading chapters:", err);
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    if (!confirm("Are you sure you want to delete this book?")) return;
    try {
      const bookRef = doc(db, "books", bookId);
      const chaptersRef = collection(bookRef, "chapters");
      const chaptersSnapshot = await getDocs(chaptersRef);

      await Promise.all(
        chaptersSnapshot.docs.map((chapterDoc) => deleteDoc(chapterDoc.ref))
      );
      await deleteDoc(bookRef);
      setBooks((prev) => prev.filter((b) => b.id !== bookId));
    } catch (err) {
      console.error("Failed to delete book:", err);
      alert("Failed to delete the book.");
    }
  };

  // Update visibleChapters when chapters or page changes
  useEffect(() => {
    if (chapters.length > 0) {
      const end = chaptersPage * CHAPTERS_PER_PAGE;
      setVisibleChapters(chapters.slice(0, end));
      setHasMoreChapters(end < chapters.length);
    } else {
      setVisibleChapters([]);
      setHasMoreChapters(false);
    }
  }, [chapters, chaptersPage]);

  const openModal = async (book: Book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
    setNewChapterTitle("");
    setNewChapterContent("");
    setEditingChapterId(null);
    setEditingContent("");
    setEditingBook(false);
    setEditedTitle(book.title);
    setEditedGenre(book.genre);
    setChaptersPage(1); // reset pagination
    await loadChapters(book.id);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBook(null);
    setChapters([]);
    setEditingChapterId(null);
    setEditingContent("");
    setEditingBook(false);
    setEditedTitle("");
    setEditedGenre("");
    setShowNewChapterModal(false);
    setNewChapterTitle("");
    setNewChapterContent("");
  };

  const openNewChapterModal = () => {
    setShowNewChapterModal(true);
    setNewChapterTitle("");
    setNewChapterContent("");
  };

  const closeNewChapterModal = () => {
    setShowNewChapterModal(false);
    setNewChapterTitle("");
    setNewChapterContent("");
    setEditingChapterId(null);
    setEditingContent("");
  };

  const startEditingChapter = (chapter: Chapter) => {
    setEditingChapterId(chapter.id);
    setEditingContent(chapter.content);
  };

  const saveEditedChapter = async (chapterId: string) => {
    if (!selectedBook || !chapterId) {
      addNotification({
        type: "error",
        title: "Error",
        message: "No chapter selected. Please try again.",
      });
      return;
    }
    
    setSavingChapter(true);
    try {
      // Validate content is not empty
      if (!editingContent.trim()) {
        addNotification({
          type: "error",
          title: "Empty Content",
          message: "Chapter content cannot be empty.",
        });
        setSavingChapter(false);
        return;
      }

      // Process content to replace local image URLs with Firebase Storage URLs
      let processedContent = editingContent;

      // Find and replace local blob URLs with Firebase Storage URLs
      const imageRegex = /!\[([^\]]*)\]\(blob:([^)]+)\)/g;
      const matches = [...processedContent.matchAll(imageRegex)];

      for (const match of matches) {
        try {
          // Convert blob URL to file and upload
          const response = await fetch(match[2]);
          const blob = await response.blob();
          const file = new File([blob], `image_${Date.now()}.png`, {
            type: blob.type,
          });
          const firebaseUrl = await uploadImageToStorage(file);

          // Replace the blob URL with Firebase URL
          processedContent = processedContent.replace(match[2], firebaseUrl);
        } catch (error) {
          console.error("Error processing image:", error);
        }
      }

      const chapterRef = doc(
        db,
        "books",
        selectedBook.id,
        "chapters",
        chapterId
      );
      await updateDoc(chapterRef, { content: processedContent });

      // Update only the edited chapter locally
      setChapters((prev) =>
        prev.map((c) =>
          c.id === chapterId ? { ...c, content: processedContent } : c
        )
      );
      setEditingChapterId(null);
      setEditingContent("");
      addNotification({
        type: "success",
        title: "Chapter Updated",
        message: "Chapter updated successfully!",
      });
    } catch (err) {
      console.error("Error saving chapter:", err);
      addNotification({
        type: "error",
        title: "Save Failed",
        message: "Failed to save chapter. Please try again.",
      });
    } finally {
      setSavingChapter(false);
    }
  };

  const deleteChapter = async (chapterId: string) => {
    if (!selectedBook) return;
    if (!confirm("Are you sure you want to delete this chapter?")) return;
    try {
      const chapterRef = doc(
        db,
        "books",
        selectedBook.id,
        "chapters",
        chapterId
      );
      await deleteDoc(chapterRef);
      // Remove the chapter from local state
      setChapters((prev) => prev.filter((c) => c.id !== chapterId));
      addNotification({
        type: "success",
        title: "Chapter Deleted",
        message: "Chapter deleted successfully!",
      });
    } catch (err) {
      console.error("Error deleting chapter:", err);
      addNotification({
        type: "error",
        title: "Deletion Failed",
        message: "Failed to delete chapter. Please try again.",
      });
    }
  };

  const startEditingBook = () => {
    setEditingBook(true);
  };

  const cancelEditingBook = () => {
    setEditingBook(false);
    setEditedTitle(selectedBook?.title || "");
    setEditedGenre(selectedBook?.genre || "");
  };

  const saveBookChanges = async () => {
    if (!selectedBook) return;

    setSavingBook(true);
    try {
      const bookRef = doc(db, "books", selectedBook.id);
      await updateDoc(bookRef, {
        title: editedTitle.trim(),
        genre: editedGenre,
      });

      // Update local state
      setBooks((prev) =>
        prev.map((b) =>
          b.id === selectedBook.id
            ? { ...b, title: editedTitle.trim(), genre: editedGenre }
            : b
        )
      );

      // Update selected book
      setSelectedBook((prev) =>
        prev ? { ...prev, title: editedTitle.trim(), genre: editedGenre } : null
      );

      setEditingBook(false);
    } catch (err) {
      console.error("Error updating book:", err);
      alert("Failed to update book. Please try again.");
    } finally {
      setSavingBook(false);
    }
  };

  // Helper to check if title already contains a chapter prefix
  function hasChapterPrefix(title: string): boolean {
    return /^\s*(chapter|chp)\b[\s:.-]*\d*/i.test(title);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blush/5 to-peach/10">
      <main className="container mx-auto px-3 sm:px-4 md:px-6 py-8 md:py-12">
        {/* Header Section */}
        <div className="text-center mb-12 md:mb-16 space-y-4 animate-fade-in">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <span className="text-5xl sm:text-6xl animate-bounce" style={{ animationDelay: '0s' }}>📚</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-taupe drop-shadow-lg">
            My Books
          </h1>
          
          <p className="text-sienna/80 text-base sm:text-lg md:text-xl max-w-2xl mx-auto font-semibold">
            Manage your stories, edit chapters, and watch your creativity grow
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20 sm:py-32">
            <div className="text-center space-y-6">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-gold/30 border-t-gold animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-4 border-peach/30 border-b-peach animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              </div>
              <p className="text-sienna/80 font-bold text-lg">Loading your books...</p>
              <p className="text-sienna/60 text-sm">This may take a moment</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-20 sm:py-32">
            <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 rounded-3xl p-12 inline-block shadow-lg">
              <p className="text-red-600 text-2xl font-bold mb-3">❌ Error</p>
              <p className="text-red-600 text-lg font-semibold mb-4">{error}</p>
              <p className="text-red-500/80 text-sm">Try refreshing the page</p>
            </div>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-20 sm:py-32">
            <div className="bg-gradient-to-br from-blush/40 to-peach/40 rounded-3xl p-12 shadow-xl border-3 border-dashed border-gold/50 max-w-md mx-auto backdrop-blur-sm">
              <div className="text-7xl mb-6 animate-bounce" style={{ animationDelay: '0.1s' }}>📚</div>
              <h2 className="text-3xl font-bold text-taupe mb-3">
                No Books Yet
              </h2>
              <p className="text-sienna/90 mb-8 text-lg font-semibold">
                Start your writing journey by creating your first book!
              </p>
              <div className="text-sm text-sienna/70 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl">💡</span>
                  <span>Click the "✨" button in the bottom right to get started</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl">🎨</span>
                  <span>Choose a cover style and write your story</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl">🚀</span>
                  <span>Share your imagination with readers worldwide</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 lg:gap-7">
            {books.map((book, index) => (
              <div
                key={book.id}
                className="group bg-white/80 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-xl border border-gold/30 overflow-hidden hover:shadow-2xl hover:border-gold/60 transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.03] active:scale-95 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Book Cover */}
                <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-blush to-peach shadow-lg">
                  <div
                
                    className={`${book.coverImage} w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500 rounded-t-2xl sm:rounded-t-3xl`}
                  />
                  {/* Genre Badge - bottom right */}
                  <div className="absolute bottom-3 right-3 bg-gold/95 text-taupe text-xs sm:text-sm font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg border border-white/40 backdrop-blur-sm">
                    🏷️ {book.genre}
                  </div>
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                    <span className="text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                     
                    </span>
                  </div>
                </div>

                {/* Book Info */}
                <div className="p-4 sm:p-5 md:p-6 flex flex-col gap-3 sm:gap-4">
                  {/* Title */}
                  <div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-taupe line-clamp-2 group-hover:text-gold transition-colors duration-300">
                      {book.title}
                    </h3>
                    {/* Author */}
                    <p className="text-xs sm:text-sm text-sienna/70 mt-1 font-semibold">
                      By {book.author}
                    </p>
                  </div>

                  {/* Synopsis */}
                  <p className="text-sienna/80 text-xs sm:text-sm line-clamp-2 flex-1">
                    {book.synopsis}
                  </p>

                  {/* Meta Info */}
                  <div className="flex justify-between items-center gap-2 text-xs sm:text-sm pt-2 border-t border-gold/20">
                    <span className="text-sienna/70 flex items-center gap-1.5 font-semibold">
                      <span>📅</span>
                      <span>
                        {(function () {
                          try {
                            return new Date(book.createdAt).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric", year: "2-digit" }
                            );
                          } catch {
                            return "N/A";
                          }
                        })()}
                      </span>
                    </span>
                    <span className="text-taupe font-bold bg-gold/20 px-2.5 py-1 rounded-full">
                      📖 {book.totalChapters || 0}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => openModal(book)}
                      className="flex-1 px-3 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg sm:rounded-xl font-bold shadow-md hover:shadow-lg transition-all text-xs sm:text-sm active:scale-95 transform hover:scale-105 border border-blue-600/30"
                      title="Edit this book"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteBook(book.id)}
                      className="px-3 py-2.5 sm:py-3 bg-red-100 hover:bg-red-200 text-red-600 font-bold rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all text-xs sm:text-sm active:scale-95 transform hover:scale-105 border border-red-300/50"
                      title="Delete this book"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Enhanced Modal */}
        {isModalOpen && selectedBook && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 pt-[80px] sm:pt-[100px]"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                closeModal();
              }
            }}
          >
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-h-[calc(95vh-80px)] sm:max-w-7xl flex flex-col border-2 border-gold/30 overflow-hidden">
              {/* Enhanced Modal Header - Mobile responsive */}
              <div className="flex-shrink-0 bg-gradient-to-r from-blush via-peach to-gold p-3 sm:p-6 rounded-t-2xl sm:rounded-t-3xl border-b border-gold/20 shadow-md">
                <div className="flex items-start sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-2 sm:gap-4 min-w-0 flex-1">
                    <div className="w-10 sm:w-14 h-14 sm:h-18 rounded-lg sm:rounded-xl overflow-hidden border-2 border-white/50 shadow-lg flex-shrink-0">
                      <div
                        className={`w-full h-full ${selectedBook.coverImage} bg-cover bg-center`}
                        style={{
                          backgroundImage: `url(${selectedBook.coverImage})`,
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg sm:text-2xl font-bold text-taupe mb-0.5 sm:mb-1 truncate">
                        📚 {selectedBook.title}
                      </h2>
                      <p className="text-xs sm:text-base text-sienna/90 truncate">
                        Manage • {chapters.length} chapters
                      </p>
                      <div className="flex items-center gap-2 mt-1 sm:mt-2 flex-wrap">
                        <span className="bg-white/30 text-taupe px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium">
                          {selectedBook.genre}
                        </span>
                        <span className="text-sienna/80 text-xs sm:text-sm truncate">
                          By {selectedBook.author}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="p-1.5 sm:p-2 rounded-full hover:bg-white/30 active:bg-white/50 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 flex-shrink-0 touch-target"
                    aria-label="Close modal"
                  >
                    <span className="text-xl sm:text-2xl text-taupe">×</span>
                  </button>
                </div>
              </div>

              {/* Enhanced Modal Content - Responsive layout */}
              <div className="flex-1 overflow-y-auto">
                <div className="flex flex-col lg:flex-row gap-0">
                  {/* Left Panel - Book Info & Chapter Creation - Full width on mobile */}
                  <div className="w-full lg:w-1/3 bg-gradient-to-b from-blush/20 to-peach/20 border-b lg:border-b-0 lg:border-r border-gold/20 overflow-y-auto lg:max-h-full">
                    <div className="h-full p-3 sm:p-6">
                      <div className="space-y-4 sm:space-y-6">
                        {/* Book Information Card */}
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gold/20">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-taupe flex items-center gap-2">
                              <span>📖</span>
                              <span>Book Information</span>
                            </h3>
                            {!editingBook ? (
                              <button
                                onClick={startEditingBook}
                                className="px-3 py-2 bg-blue-100 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-200 active:scale-95 transition-all shadow-sm border border-blue-300/50"
                              >
                                ✏️ Edit
                              </button>
                            ) : (
                              <div className="flex gap-2 flex-col sm:flex-row">
                                <button
                                  onClick={saveBookChanges}
                                  disabled={savingBook}
                                  className="flex-1 sm:flex-none px-3 py-2.5 sm:py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 shadow-md hover:shadow-lg active:scale-95 border border-green-600/30"
                                >
                                  {savingBook ? "💾 Saving..." : "💾 Save"}
                                </button>
                                <button
                                  onClick={cancelEditingBook}
                                  className="flex-1 sm:flex-none px-3 py-2.5 sm:py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-all shadow-md hover:shadow-lg active:scale-95 border border-gray-300/50"
                                >
                                  ❌ Cancel
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-semibold text-sienna mb-2">
                                📝 Title
                              </label>
                              {editingBook ? (
                                <input
                                  type="text"
                                  value={editedTitle}
                                  onChange={(e) =>
                                    setEditedTitle(e.target.value)
                                  }
                                  className="w-full px-4 py-3 border-2 border-gold/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold bg-white text-taupe shadow-sm transition-all"
                                  placeholder="Enter book title..."
                                />
                              ) : (
                                <p className="text-taupe font-semibold text-lg">
                                  {selectedBook.title}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-sienna mb-2">
                                👤 Author
                              </label>
                              <p className="text-taupe">
                                {selectedBook.author}
                              </p>
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-sienna mb-2">
                                🏷️ Genre
                              </label>
                              {editingBook ? (
                                <select
                                  value={editedGenre}
                                  onChange={(e) =>
                                    setEditedGenre(e.target.value)
                                  }
                                  className="w-full px-4 py-3 border-2 border-gold/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold bg-white text-taupe shadow-sm transition-all"
                                >
                                  <option value="">Select a genre...</option>
                                  {[
                                    "Romance",
                                    "Fantasy",
                                    "Mystery",
                                    "Science Fiction",
                                    "Historical Fiction",
                                    "Thriller",
                                    "Horror",
                                    "Adventure",
                                    "Comedy",
                                    "Drama",
                                    "Poetry",
                                    "Non-Fiction",
                                    "Biography",
                                    "Self-Help",
                                    "Educational",
                                  ].map((genre) => (
                                    <option key={genre} value={genre}>
                                      {genre}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <span className="inline-block bg-gold/20 text-taupe px-3 py-1 rounded-full text-sm font-medium">
                                  {selectedBook.genre}
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-semibold text-sienna mb-1">
                                  📚 Chapters
                                </label>
                                <p className="text-2xl font-bold text-taupe">
                                  {chapters.length}
                                </p>
                              </div>

                              <div>
                                <label className="block text-sm font-semibold text-sienna mb-1">
                                  📅 Created
                                </label>
                                <p className="text-taupe">
                                  {(function () {
                                    try {
                                      return new Date(
                                        selectedBook.createdAt
                                      ).toLocaleDateString();
                                    } catch {
                                      return "N/A";
                                    }
                                  })()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-lg border border-gold/20">
                          <h3 className="text-base sm:text-lg font-bold text-taupe mb-3 sm:mb-4 flex items-center gap-2">
                            <span>⚡</span>
                            <span className="hidden sm:inline">
                              Quick Actions
                            </span>
                          </h3>
                          <div className="space-y-2 sm:space-y-3">
                            <button
                              onClick={openNewChapterModal}
                              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-gold to-sienna text-taupe rounded-lg sm:rounded-xl font-bold hover:from-sienna hover:to-gold transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2 text-sm sm:text-base border-2 border-gold/30"
                            >
                              <span>✨</span>
                              <span>New Chapter</span>
                            </button>
                            <button
                              onClick={() =>
                                window.open(
                                  `/books/${selectedBook.id}`,
                                  "_blank"
                                )
                              }
                              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg sm:rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2 text-sm sm:text-base border-2 border-blue-600/30"
                            >
                              <span>👁️</span>
                              <span>Preview</span>
                            </button>
                          </div>
                        </div>

                        {/* Chapter Stats */}
                        <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-lg border border-gold/20">
                          <h3 className="text-base sm:text-lg font-bold text-taupe mb-3 sm:mb-4 flex items-center gap-2">
                            <span>📊</span>
                            <span className="hidden sm:inline">Stats</span>
                          </h3>
                          <div className="grid grid-cols-2 gap-2 sm:gap-4 text-center">
                            <div className="p-2 sm:p-3 bg-blush/30 rounded-lg sm:rounded-xl">
                              <div className="text-xl sm:text-2xl font-bold text-taupe">
                                {chapters.length}
                              </div>
                              <div className="text-xs text-sienna/80">
                                Chapters
                              </div>
                            </div>
                            <div className="p-2 sm:p-3 bg-peach/30 rounded-lg sm:rounded-xl">
                              <div className="text-xl sm:text-2xl font-bold text-taupe">
                                {chapters.reduce(
                                  (total, chapter) =>
                                    total +
                                    (chapter.content?.split(/\s+/).length || 0),
                                  0
                                )}
                              </div>
                              <div className="text-xs text-sienna/80">
                                Total Words
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Panel - Chapters List */}
                  <div className="w-full lg:w-2/3 bg-white flex flex-col overflow-hidden lg:max-h-full">
                    <div className="flex-shrink-0 p-3 sm:p-6 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg sm:text-xl font-bold text-taupe flex items-center gap-2">
                          <span>📖</span>
                          <span>Chapters ({chapters.length})</span>
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-sienna/80">
                          <span>
                            📊 Total:{" "}
                            {chapters.reduce(
                              (acc, ch) =>
                                acc + (ch.content?.split(/\s+/).length || 0),
                              0
                            )}{" "}
                            words
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 sm:p-6">
                      {chapters.length === 0 ? (
                        <div className="text-center py-16 bg-gradient-to-br from-blush/20 to-peach/20 rounded-2xl border-2 border-dashed border-gold/30">
                          <div className="text-6xl mb-4">📖</div>
                          <h4 className="text-xl font-bold text-taupe mb-2">
                            No Chapters Yet
                          </h4>
                          <p className="text-sienna/80 mb-4">
                            Create your first chapter using the enhanced editor!
                          </p>
                          <div className="text-sm text-sienna/60">
                            💡 Tip: Use the rich text editor to add formatting
                            and images
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {visibleChapters.map((chapter) => {
                            const chapterNumber =
                              chapters.findIndex((c) => c.id === chapter.id) +
                              1;
                            return (
                              <div
                                key={chapter.id}
                                className="bg-gradient-to-r from-blush/10 to-peach/10 border border-gold/20 rounded-xl p-4 sm:p-5 hover:shadow-lg transition-all duration-300"
                              >
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-base sm:text-lg font-bold text-taupe mb-1 truncate">
                                      {hasChapterPrefix(chapter.title)
                                        ? chapter.title
                                        : `Chapter ${chapterNumber}: ${chapter.title}`}
                                    </h4>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-sienna/80">
                                      <span className="flex items-center gap-1">
                                        <span>📅</span>
                                        <span>
                                          {(function () {
                                            try {
                                              if (
                                                typeof chapter.createdAt ===
                                                  "object" &&
                                                chapter.createdAt?.seconds
                                              ) {
                                                return new Date(
                                                  chapter.createdAt.seconds *
                                                    1000
                                                ).toLocaleDateString();
                                              } else if (
                                                typeof chapter.createdAt ===
                                                  "string" ||
                                                typeof chapter.createdAt ===
                                                  "number"
                                              ) {
                                                return new Date(
                                                  chapter.createdAt
                                                ).toLocaleDateString();
                                              } else {
                                                return "N/A";
                                              }
                                            } catch {
                                              return "N/A";
                                            }
                                          })()}
                                        </span>
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <span>📝</span>
                                        <span>
                                          {(function () {
                                            try {
                                              return chapter.content?.trim()
                                                ? `${
                                                    chapter.content
                                                      .trim()
                                                      .split(/\s+/).length
                                                  } words`
                                                : "0 words";
                                            } catch {
                                              return "0 words";
                                            }
                                          })()}
                                        </span>
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex gap-2 flex-wrap justify-start sm:justify-end">
                                    {editingChapterId === chapter.id ? (
                                      <>
                                        <button
                                          onClick={() =>
                                            saveEditedChapter(chapter.id)
                                          }
                                          disabled={savingChapter}
                                          className="px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed touch-target flex items-center gap-1"
                                        >
                                          {savingChapter ? (
                                            <>
                                              <span className="inline-block animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full"></span>
                                              Saving
                                            </>
                                          ) : (
                                            <>💾 Save</>
                                          )}
                                        </button>
                                        <button
                                          onClick={() =>
                                            setEditingChapterId(null)
                                          }
                                          disabled={savingChapter}
                                          className="px-3 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed touch-target"
                                        >
                                          ❌ Cancel
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        <button
                                          onClick={() => {
                                            setEditingContent(chapter.content);
                                            setEditingChapterId(chapter.id);
                                          }}
                                          className="px-3 py-2 bg-blue-100 text-blue-700 rounded-xl text-sm font-semibold hover:bg-blue-200 transition-all shadow-sm hover:shadow-md touch-target"
                                        >
                                          ✏️ Edit
                                        </button>
                                        <button
                                          onClick={() =>
                                            deleteChapter(chapter.id)
                                          }
                                          className="px-3 py-2 bg-red-100 text-red-700 rounded-xl text-sm font-semibold hover:bg-red-200 transition-all shadow-sm hover:shadow-md touch-target"
                                        >
                                          🗑️ Delete
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          {hasMoreChapters && (
                            <div className="flex justify-center mt-4">
                              <button
                                onClick={() =>
                                  setChaptersPage((prev) => prev + 1)
                                }
                                className="px-6 py-2 bg-gold text-taupe rounded-xl font-semibold hover:bg-sienna hover:text-gold transition-all shadow-lg"
                              >
                                Load More
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* New Chapter Creation Modal */}
        {showNewChapterModal && selectedBook && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                closeNewChapterModal();
              }
            }}
          >
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-7xl h-[95vh] flex flex-col border border-gold/20 overflow-hidden">
              {/* Modal Header */}
              <div className="flex-shrink-0 bg-gradient-to-r from-blush via-peach to-gold p-6 rounded-t-3xl border-b border-gold/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-18 rounded-xl overflow-hidden border-2 border-white/50 shadow-lg flex-shrink-0">
                      <div
                        className={`w-full h-full ${selectedBook.coverImage} bg-cover bg-center`}
                        style={{
                          backgroundImage: `url(${selectedBook.coverImage})`,
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-2xl font-bold text-taupe mb-1 truncate">
                        ✍️ Create New Chapter
                      </h2>
                      <p className="text-sienna/90 text-base truncate">
                        Add a new chapter to "{selectedBook.title}"
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="bg-white/30 text-taupe px-3 py-1 rounded-full text-sm font-medium">
                          Chapter {chapters.length + 1}
                        </span>
                        <span className="text-sienna/80 text-sm">
                          Enhanced Editor
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={closeNewChapterModal}
                    className="p-2 rounded-full hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 flex-shrink-0"
                    aria-label="Close modal"
                  >
                    <span className="text-xl text-taupe">×</span>
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-hidden">
                <div className="h-full flex flex-col lg:flex-row max-h-screen overflow-hidden">
                  {/* Right Panel - Text Editor */}
                  <div className="flex-1 bg-white flex flex-col overflow-hidden">
                    <div className="flex-shrink-0 p-6 border-b border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-taupe flex items-center gap-2">
                          <span>📝</span>
                          Chapter Content
                        </h3>
                        <div className="text-sm text-sienna/80 bg-sienna/10 px-3 py-1 rounded-full">
                          Enhanced Editor
                        </div>
                      </div>
                      {/* Upload status indicator */}
                      {uploadingImage && (
                        <div className="flex items-center gap-2 text-sienna/80">
                          <span className="animate-spin">⌛</span>
                          Uploading image...
                        </div>
                      )}
                    </div>

                    {/* Chapter Title Input */}
                    <div className="p-6 border-b border-gray-100 bg-gray-50">
                      <label
                        htmlFor="chapter-title"
                        className="block text-taupe font-semibold mb-2"
                      >
                        Chapter Title
                      </label>
                      <input
                        id="chapter-title"
                        type="text"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 text-base"
                        placeholder="Enter chapter title..."
                        value={newChapterTitle}
                        onChange={(e) => setNewChapterTitle(e.target.value)}
                        maxLength={120}
                        required
                      />
                    </div>
                    {/* This makes the editor pane scrollable */}
                    <div className="flex-1 overflow-auto p-6">
                      <div className="min-h-full border border-gold/30 rounded-2xl bg-white shadow-lg">
                        <TextCrafter
                          value={newChapterContent}
                          onChange={handleContentChange}
                          onImageUpload={handleImageUpload}
                          placeholder="Start writing your chapter here... Use the toolbar above for formatting and to add images!"
                          className="h-full"
                        />
                      </div>
                    </div>
                    {/* Create Chapter Button */}
                    <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                      <button
                        className="px-6 py-2 bg-gold text-white font-semibold rounded-lg shadow hover:bg-yellow-600 transition disabled:opacity-50"
                        onClick={handleCreateChapter}
                        disabled={
                          !newChapterTitle.trim() ||
                          !newChapterContent.trim() ||
                          creatingChapter
                        }
                      >
                        {creatingChapter ? "Creating..." : "Create Chapter"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Edit Chapter Modal */}
        {editingChapterId && selectedBook && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setEditingChapterId(null);
              }
            }}
          >
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-7xl h-[95vh] flex flex-col border border-gold/20 overflow-hidden">
              {/* Modal Header */}
              <div className="flex-shrink-0 bg-gradient-to-r from-blush via-peach to-gold p-6 rounded-t-3xl border-b border-gold/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-18 rounded-xl overflow-hidden border-2 border-white/50 shadow-lg flex-shrink-0">
                      <div
                        className={`w-full h-full ${selectedBook.coverImage} bg-cover bg-center`}
                        style={{
                          backgroundImage: `url(${selectedBook.coverImage})`,
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-2xl font-bold text-taupe mb-1 truncate">
                        ✍️ Edit Chapter
                      </h2>
                      <p className="text-sienna/90 text-base truncate">
                        Editing chapter in "{selectedBook.title}"
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingChapterId(null)}
                    className="p-2 rounded-full hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 flex-shrink-0"
                    aria-label="Close modal"
                  >
                    <span className="text-xl text-taupe">×</span>
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-hidden">
                <div className="h-full flex flex-col lg:flex-row max-h-screen overflow-hidden">
                  {/* Right Panel - Text Editor */}
                  <div className="flex-1 bg-white flex flex-col overflow-hidden">
                    <div className="flex-shrink-0 p-6 border-b border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-taupe flex items-center gap-2">
                          <span>📝</span>
                          Chapter Content
                        </h3>
                        <div className="text-sm text-sienna/80 bg-sienna/10 px-3 py-1 rounded-full">
                          Enhanced Editor
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEditedChapter(editingChapterId)}
                          disabled={savingChapter}
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {savingChapter ? (
                            <>
                              <span className="inline-block animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                              Saving...
                            </>
                          ) : (
                            <>💾 Save Changes</>
                          )}
                        </button>
                        <button
                          onClick={() => setEditingChapterId(null)}
                          disabled={savingChapter}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>

                    {/* Editor pane */}
                    <div className="flex-1 overflow-auto p-6">
                      <div className="min-h-full border border-gold/30 rounded-2xl bg-white shadow-lg">
                        <TextCrafter
                          value={editingContent}
                          onChange={(content) => setEditingContent(content)}
                          onImageUpload={handleImageUpload}
                          placeholder="Edit your chapter content here..."
                          className="h-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export const Books = () => {
  return (
    <NotificationProvider>
      <BooksComponent />
    </NotificationProvider>
  );
};

export default Books;
