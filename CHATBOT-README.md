# Your ChatGPT-like Chatbot 🤖

A modern, feature-rich chatbot built with Next.js, React, and the AI SDK.

## 🚀 Quick Start

The chatbot is now running at: http://localhost:3000

## ✨ Features

- **Modern UI**: Beautiful, responsive chat interface similar to ChatGPT
- **Real-time Streaming**: See responses as they're generated
- **Multiple AI Models**: Supports xAI Grok, OpenAI, and other providers
- **File Uploads**: Chat about documents, images, and more
- **Code Highlighting**: Syntax highlighting for code blocks
- **Dark/Light Theme**: Toggle between themes
- **Chat History**: Save and resume conversations
- **Guest Mode**: No signup required to start chatting

## 🔧 Configuration

### Demo Mode (Current)
- The bot is running in demo mode with mock responses
- No API keys required
- Perfect for testing the interface

### Real AI Mode
To use real AI responses, add your API keys to `.env.local`:

```bash
# For xAI Grok (default)
XAI_API_KEY=your-xai-api-key-here

# Or for OpenAI
OPENAI_API_KEY=your-openai-api-key-here
```

Get your API keys:
- [xAI Console](https://console.x.ai/) - For Grok models
- [OpenAI](https://platform.openai.com/) - For GPT models

## 🎯 How to Use

1. Open http://localhost:3000 in your browser
2. Start typing your message in the chat input
3. Press Enter or click Send
4. Watch the AI response stream in real-time

## 🛠 Development

- **Start Dev Server**: `pnpm dev`
- **Build**: `pnpm build`
- **Lint**: `pnpm lint`

## 📁 Project Structure

- `app/` - Next.js 15 app router
- `components/` - Reusable React components
- `lib/` - Utilities, AI configuration, database
- `public/` - Static assets

Enjoy your new chatbot! 🎉
