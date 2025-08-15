# MindMine 📚

A modern digital publishing platform that connects authors and readers in a seamless reading and writing experience.

**Live Demo:** [https://mindmine.netlify.app/](https://mindmine.netlify.app/)

## 🌟 Overview

MindMine is a comprehensive platform designed for the modern literary community. Authors can craft, publish, and manage their books while readers discover and enjoy content in an intuitive, engaging environment. Built with cutting-edge web technologies, MindMine offers a fast, responsive, and user-friendly experience for all users.

## ✨ Features

### For Authors
- **📝 Rich Text Editor** - Write and format your books with an intuitive editor
- **📖 Book Management** - Create, edit, and organize your literary works
- **📊 Analytics Dashboard** - Track reader engagement and book performance
- **🎨 Customizable Profiles** - Showcase your author brand and portfolio
- **📱 Mobile-Friendly Writing** - Write on any device, anywhere

### For Readers
- **🔍 Book Discovery** - Explore books by genre, author, or popularity
- **📚 Personal Library** - Save and organize your favorite reads
- **💬 Interactive Reading** - Engage with content and authors
- **📲 Cross-Device Sync** - Continue reading across all your devices
- **🌙 Reading Modes** - Customize your reading experience

### Platform Features
- **⚡ Lightning Fast** - Optimized performance with Astro's static generation
- **🔐 Secure Authentication** - Firebase-powered user management
- **☁️ Cloud Storage** - Reliable content storage and backup
- **📱 Responsive Design** - Perfect experience on desktop, tablet, and mobile
- **🌐 SEO Optimized** - Built for discoverability

### 📚 Book Management
- Create and manage your own books
- Rich text editing with markdown support
- Real-time preview while writing
- Chapter organization and management

### ✍️ Enhanced Chapter Creation
- **Advanced Text Editor**: Full-featured TextCrafter editor with rich formatting options
- **Robust Markdown Support**: Write in GitHub Flavored Markdown (GFM) with live preview, powered by the `marked` library.
- **Formatting Tools**: Bold, italic, strikethrough, headings, lists, code blocks, links, task lists, blockquotes, and horizontal rules.
- **Extended Formatting (Non-Standard Markdown)**: Support for highlight (==text==), superscript (<sup>text</sup>), and subscript (<sub>text</sub>) via HTML passthrough.
- **Image Upload**: Drag & drop or click to upload images directly into your chapters, with progress indicator and alt text support.
- **Auto-save**: Automatic saving of your work as you type
- **Word Count**: Real-time word and character counting
- **Export Options**: Export your content as Markdown or HTML

### 🎨 Rich Content Support
- **Images**: Upload and embed images in your chapters
- **Formatting**: Rich text formatting with toolbar
- **Links**: Add external links to your content
- **Code Blocks**: Include code snippets with syntax highlighting
- **Lists**: Create bulleted and numbered lists
- **Quotes**: Add blockquotes for emphasis

### 🔐 Authentication
- Secure user authentication with Firebase Auth
- User-specific book management
- Protected admin areas

### 📱 Responsive Design
- Mobile-friendly interface
- Touch-optimized controls
- Adaptive layout for all devices

## 🛠️ Tech Stack

- **Frontend Framework:** [Astro](https://astro.build/) - Modern static site generator
- **UI Components:** [React](https://reactjs.org/) - Interactive user interfaces
- **Backend & Database:** [Firebase](https://firebase.google.com/) - Authentication, Firestore, and Storage
- **Deployment:** [Netlify](https://netlify.com/) - Fast, reliable hosting
- **Styling:** Modern CSS with responsive design principles

## 🚀 Getting Started

### Prerequisites

Before running MindMine locally, ensure you have:

- Node.js (v18 or higher)
- npm or yarn package manager
- Firebase project with configured services

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mindmine.git
   cd mindmine
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   PUBLIC_FIREBASE_API_KEY=your_api_key
   PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:4321` to see MindMine in action.

## 📁 Project Structure

```
mindmine/
├── src/
│   ├── components/        # React components
│   ├── pages/            # Astro pages and routes
│   ├── layouts/          # Page layouts
│   ├── styles/           # CSS and styling
│   ├── lib/              # Utility functions and Firebase config
│   └── types/            # TypeScript type definitions
├── public/               # Static assets
├── astro.config.mjs      # Astro configuration
└── package.json          # Dependencies and scripts
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality
- `npm run type-check` - Run TypeScript type checking

## 🚀 Deployment

MindMine is automatically deployed to Netlify when changes are pushed to the main branch. The deployment process includes:

1. **Build Process** - Astro generates optimized static files
2. **Asset Optimization** - Images and resources are compressed
3. **CDN Distribution** - Content served from global edge locations
4. **Automatic SSL** - HTTPS enabled by default

### Manual Deployment

To deploy manually:

```bash
npm run build
# Upload the 'dist' folder to your hosting provider
```

## 🤝 Contributing

We welcome contributions to MindMine! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow existing code style and conventions
- Write clear, descriptive commit messages
- Add tests for new features when applicable
- Update documentation as needed

## 📧 Support & Contact

- **Website:** [https://mindmine.netlify.app/](https://mindmine.netlify.app/)
- **Issues:** [GitHub Issues](https://github.com/yourusername/mindmine/issues)
- **Email:** support@mindmine.com

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Thanks to the Astro team for the amazing static site generator
- Firebase team for robust backend services
- The open-source community for inspiration and tools
- All our beta users and contributors

---

**Built with ❤️ for the literary community**

*MindMine - Where stories come to life*

## Chapter Creation Guide

### Using the TextCrafter Editor

1. **Access**: Go to "My Books" and click "Manage" on any book
2. **Create Chapter**: Fill in the chapter title and use the enhanced text editor
3. **Formatting**: Use the toolbar for:
   - **Bold** (Ctrl+B): Make text bold
   - **Italic** (Ctrl+I): Make text italic
   - **Headings** (Ctrl+Alt+1-6): Create different heading levels
   - **Lists**: Create bulleted or numbered lists
   - **Links**: Add clickable links
   - **Code**: Add inline code or code blocks

### Adding Images

1. **Upload**: Click the image button in the toolbar or drag & drop images
2. **Preview**: Adjust image size and position in the preview modal
3. **Insert**: Click "Insert Image" to add it to your content
4. **Storage**: Images are automatically uploaded to Firebase Storage

### Tips for Better Content

- Use headings to organize your chapter structure
- Add images to make your content more engaging
- Use bold and italic for emphasis
- Include links to external resources
- Preview your content before saving