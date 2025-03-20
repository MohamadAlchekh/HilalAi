<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Smalot\PdfParser\Parser;
use GuzzleHttp\Client; // Use Guzzle

class PdfController extends Controller
{
    public function processPdf(Request $request)
    {
        // Validate the uploaded file
        $request->validate([
            'pdf' => 'required|mimes:pdf|max:10000'
        ]);

        // Get the uploaded PDF file
        $pdfFile = $request->file('pdf');

        // Extract text from the PDF
        $parser = new Parser();
        $pdf = $parser->parseFile($pdfFile->path());
        $text = $pdf->getText();

        // Send text to Gemini API
        $geminiResponse = $this->callGeminiApi($text);

        // Return the response
        return response()->json([
            'message' => 'PDF processed successfully!',
            'filename' => $pdfFile->getClientOriginalName(),
            'size' => $pdfFile->getSize() . ' bytes',
            // 'text' => $text,
            'ai_response' => $geminiResponse,
            'status' => 'processed'
        ]);
    }

    private function callGeminiApi($text)
{
    $client = new Client();
    $apiKey = env('GEMINI_API_KEY');

    try {
        $response = $client->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-pro-exp-02-05:generateContent?key={$apiKey}", [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'contents' => [
                    [
                        'parts' => [
                            [
                                'text' => "Return a JSON object with two keys: 'summary' (a summary of this text in 50 words) and 'questions' (an array of 3 objects, each with 'question' (a string), 'options' (array of 4 strings), and 'correct_answer' (a string matching one option)). Text:\n\n{$text}"
                            ]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'maxOutputTokens' => 500,
                    'temperature' => 0.7
                ]
            ]
        ]);

        $data = json_decode($response->getBody(), true);
        $rawText = $data['candidates'][0]['content']['parts'][0]['text'];

        // Clean up the response by removing ```json and ``` markers
        $cleanedText = preg_replace('/```json\n|\n```/', '', $rawText);
        $jsonResponse = json_decode($cleanedText, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception('Failed to parse AI response as JSON');
        }

        return $jsonResponse; // Return the parsed JSON object
    } catch (\Exception $e) {
        return 'Error calling Gemini API: ' . $e->getMessage();
    }
}
}