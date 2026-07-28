# AI Service Documentation

## Overview of AI Capabilities
The SentinelChain AI service integrates advanced machine learning models to automatically analyze uploaded evidence. Capabilities include:
*   **Document Analysis:** OCR extraction, summarization, and keyword extraction.
*   **Image Analysis:** Forgery detection, object recognition, and facial recognition (if permitted).
*   **Video Analysis:** Frame-by-frame deepfake detection and transcription of audio tracks.
*   **Audio Analysis:** Speech-to-text transcription and voice anomaly detection.

## API Endpoints
The AI service is typically invoked internally by the backend API.
*   **POST** `/internal/ai/analyze`
    *   **Body:** `{ "evidenceId": "...", "fileUrl": "...", "type": "document" }`
    *   **Response:** `{ "analysisId": "...", "status": "processing" }`

*   **GET** `/internal/ai/results/:analysisId`
    *   **Response:** `{ "status": "completed", "results": { "summary": "...", "confidenceScore": 0.95 } }`

## Model Information
*   **Text/Document:** Custom fine-tuned LLM based on LLaMA 3.
*   **Image/Video:** Ensemble of ResNet and custom Deepfake detection architectures.
*   **Audio:** Whisper for transcription, custom models for voice analysis.

## Configuration Options
AI models can be configured via environment variables:
*   `AI_CONFIDENCE_THRESHOLD=0.85` - Minimum confidence score for auto-verification.
*   `ENABLE_DEEPFAKE_DETECTION=true` - Toggle intensive video analysis.

## Extending the AI Service
To add new AI capabilities, implement a new strategy class in the `services/ai/strategies` directory and register it with the main AI controller. Ensure it implements the `IAIStrategy` interface which requires an `analyze()` method.
