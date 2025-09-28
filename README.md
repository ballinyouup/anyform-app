# 📄 Multi-Part Input Distribution

Transform a single input into **multiple outputs** — PDFs, audio (MP3), images, and more.  
This project demonstrates a pipeline that accepts an uploaded PDF, extracts text, and generates a summarized output using Google Gemini. The architecture is modular so you can add audio, image generation, or streaming later.

---

## 🔖 One-liner
**Split one input into many outputs — PDFs, MP3s, images, and more.**

---

## 🚀 Features
-**Three input modes**: upload file, paste text, or (WIP) lightweight web searc
-**PDF text extraction** on the client using pdfjs-dist with a local worker (public/pdf.worker.min.js).
-**Summarization** powered by **Google Gemini** (@google/genai).
-**Optional** **Text‑to‑Speech** via ElevenLabs (returns an MP3 stream).
-**Modern UI**: Next.js App Router, Tailwind v4, shadcn/ui, Radix primitives, lucide icons.
-**TypeScript-first** with a small, modular lib (/src/lib) and reusable components (/src/components).

---

## 🧠 Inspiration
Different people prefer different mediums — reading, listening, or viewing. This project was inspired by the idea of making the same content accessible across multiple formats simultaneously.

---

## 📦 Tech Stack
- **Framework**: Next.js (App Router)
- **Parsing**: TypeScript
- **AI**: @google/genai (Gemini 2.5 Flash) – text/grounded responses; Imagen (prompt generation) 
- **Audio**: ElevenLabs TTS

---

## 🛠️ How it works
1. Upload a PDF via a form request.  
2. Convert the uploaded file into a buffer.  
3. Extract text using `pdf-parse`.  
4. Send the extracted text to Gemini for summarization.  
5. Return a clean JSON response.  

---

## 📂 Example File Structure

```text
/
src/
  app/
  layout.tsx
  page.tsx # main UI (tabs: file / text / websearch)
  api/
    process-audio/ # POST – calls Gemini on uploaded audio (transcribe + image prompts)
    text-to-speech/ # POST – streams MP3 from ElevenLabs
  components/ # DropZone, OutputDisplay, AudioPlayer, FileViewer, shadcn/ui
  hooks/
  lib/ # geminiService.ts, utils.ts (PDF), types.ts, audioUtils.ts
public/
  pdf.worker.min.js # PDF.js worker (required for client extraction)
```

---

## ⚙️ Environment Variables

Create .env.local in the project root:
```console
# Required for Gemini (summarization, prompts)
GEMINI_API_KEY=your_google_generative_ai_key
# Optional – only if you want MP3 audio via ElevenLabs
ELEVENLABS_API_KEY=your_eleven_labs_key
```
If you don’t set ELEVENLABS_API_KEY, the app still works for text summary; the /api/text-to-speech route will return a helpful error.
## ⚙️ Quickstart

# 1) Install deps
npm install


# If you see "Cannot find module 'next' or 'react'",
# add them explicitly (some templates omit these):
npm i next@latest react@latest react-dom@latest


# 2) Dev server
npm run dev
# -> http://localhost:3000


# 3) Build & start (production)
npm run build && npm start
```

## 🎉 Accomplishments
- Built a system that transforms one input into multiple outputs.  
- Successfully demonstrated PDF → Text → AI Summary.  
- Designed modular architecture for extending into audio, images, and video.  

---

## ⚠️ Challenges
- Large PDFs and memory optimization.  
- Summarization accuracy and prompt tuning.  
- Handling quirks of different formats (PDF layout vs. audio pronunciation).  

---

## 📚 What we learned
- Working with multiple content formats in one pipeline.  
- How to integrate AI models into serverless functions.  
- The importance of accessibility-first design.  

---

## 🔭 Roadmap
- Add **text-to-speech (MP3)** output.  
- Add **image/diagram generation** from extracted text.  
- Support **video narration** and **real-time streaming**.  
- Integrate with **cloud storage** (Google Drive, S3).  
- Provide a **UI for uploads & downloads**.
---
## 🎯 Goals

- Make one input accessible across **multiple formats** (PDF, audio, images).
- Improve **accessibility** for people with different needs (visual, auditory, cognitive).
- Enable **low-bandwidth** and **offline-friendly** distribution (smaller, targeted outputs).
- Provide **education-ready** content (summaries, study notes, slides).
- Offer **plug-and-play modules** so others can extend the pipeline (TTS, diagrams, video).
- Keep it **open-source**, documented, and easy to adopt.
---
## 🌍 How this fits: AI for Good — Helping Humanity

- **Accessibility & Inclusion:** Converts the same content into formats that serve screen-reader users, language learners, and people on the go.
- **Equity of Access:** Lowers friction for communities with constrained devices or connectivity by generating lightweight alternatives (text, compressed audio).
- **Education & Literacy:** Produces clear summaries and multimodal learning aids that support students and lifelong learners.
- **Crisis & Public Info:** Supports rapid reformatting of guidance (health, safety, disaster updates) into readable, audible, and visual versions.
- **Sustainable Use of AI:** Promotes **right-sized** outputs (only what’s needed, when it’s needed) to reduce unnecessary compute and storage.

