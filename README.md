# Scriptora

A beautiful and modern platform for readers and authors to share their stories.

## Features

- 📚 Browse and discover books
- ✍️ Write and publish your own stories
- 👥 Connect with other readers and authors
- 🎨 Beautiful, animated UI with a girlish color scheme
- 🔒 Secure authentication with Firebase
- 📱 Responsive design for all devices

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your Firebase configuration:
   ```
   PUBLIC_FIREBASE_API_KEY=your_api_key_here
   PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
   PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
   PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
   PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
   PUBLIC_FIREBASE_APP_ID=your_app_id_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Tech Stack

- [Astro](https://astro.build) - The web framework for content-driven websites
- [Tailwind CSS](https://tailwindcss.com) - A utility-first CSS framework
- [Firebase](https://firebase.google.com) - Backend and authentication
- [Framer Motion](https://www.framer.com/motion/) - Animation library

## Color Scheme

```javascript
{
  blush: '#F9E4E0',    // Main background
  rosewood: '#C36C5D', // Primary button
  taupe: '#4E3B36',    // Main text
  peach: '#FCEEEA',    // Genre section background
  white: '#FFFFFF',    // White cards/buttons
  sienna: '#A35641',   // Accent (icons/images)
  gold: '#D9BFA3',     // Accent (subtle highlight)
  mauve: '#EECFC5',    // Genre icon circles
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

```sh
npm create astro@latest -- --template basics
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/withastro/astro/tree/latest/examples/basics)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/withastro/astro/tree/latest/examples/basics)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/withastro/astro?devcontainer_path=.devcontainer/basics/devcontainer.json)

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

![just-the-basics](https://github.com/withastro/astro/assets/2244813/a0a5533c-a856-4198-8470-2d67b1d7c554)

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
