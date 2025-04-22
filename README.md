# Learn German Pronunciation

A web application to help users practice and improve their German pronunciation with real-time feedback.

## Features

- Practice pronunciation of German vocabulary words
- Real-time speech recognition using the Web Speech API
- Pronunciation accuracy assessment with visual feedback
- Word selection by language proficiency level (A1, A2)
- Instant feedback on pronunciation quality

## Prerequisites

- Node.js 18.x or higher
- NPM or Yarn
- A modern web browser with microphone access (Chrome, Firefox, Edge, etc.)

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd learn-german
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

## How to Use

1. Select a language level (A1 or A2)
2. Click the microphone button and pronounce the displayed German word
3. Click the stop button when you're done speaking
4. View your pronunciation accuracy score and feedback
5. Click "Next Word" to continue practicing with a new word

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) - Speech recognition
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [React Icons](https://react-icons.github.io/react-icons/) - UI icons

## Browser Compatibility

The application uses the Web Speech API which is supported in:
- Chrome (desktop and Android)
- Edge
- Safari (desktop and iOS, limited support)
- Firefox (limited support)

## License

MIT
