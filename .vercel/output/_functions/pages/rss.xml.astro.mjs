import { d as db } from '../chunks/firebase_BJ45oOlh.mjs';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
export { renderers } from '../renderers.mjs';

async function GET() {
  const booksRef = collection(db, "books");
  const booksSnapshot = await getDocs(
    query(booksRef, orderBy("createdAt", "desc"))
  );
  const feedItems = booksSnapshot.docs.map((doc) => {
    const bookId = doc.id;
    const book = doc.data();
    const pubDate = book.createdAt?.seconds ? new Date(book.createdAt.seconds * 1e3).toUTCString() : (/* @__PURE__ */ new Date()).toUTCString();
    const bookUrl = `https://yourdomain.com/books/${bookId}`;
    return `
      <item>
        <title><![CDATA[${book.title}]]></title>
        <link>${bookUrl}</link>
        <description><![CDATA[${book.synopsis || "No description available."}]]></description>
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
      "Content-Type": "application/rss+xml"
    }
  });
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
