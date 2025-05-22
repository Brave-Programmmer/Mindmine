import { db } from "../firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

export async function GET() {
  const booksRef = collection(db, "books");
  const booksSnapshot = await getDocs(
    query(booksRef, orderBy("createdAt", "desc"))
  );

  const feedItems: string[] = booksSnapshot.docs.map((doc) => {
    const bookId = doc.id;
    const book = doc.data() as {
      title: string;
      author: string;
      genre: string;
      synopsis: string;
      coverImage: string;
      createdAt: any;
    };

    const pubDate = book.createdAt?.seconds
      ? new Date(book.createdAt.seconds * 1000).toUTCString()
      : new Date().toUTCString();
    const bookUrl = `https://yourdomain.com/books/${bookId}`;

    return `
      <item>
        <title><![CDATA[${book.title}]]></title>
        <link>${bookUrl}</link>
        <description><![CDATA[${
          book.synopsis || "No description available."
        }]]></description>
        <author><![CDATA[${book.author}]]></author>
        <category><![CDATA[${book.genre}]]></category>
        <pubDate>${pubDate}</pubDate>
        <enclosure url="${book.coverImage}" type="image/jpeg" />
        <guid isPermaLink="false">${bookId}</guid>
      </item>
    `;
  });

  const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>Scriptora: New Books</title>
    <link>https://yourdomain.com</link>
    <description>Recently published books on Scriptora</description>
    <language>en-us</language>
    ${feedItems.join("\n")}
  </channel>
</rss>`;

  return new Response(rssFeed, {
    headers: {
      "Content-Type": "application/rss+xml",
    },
  });
}
