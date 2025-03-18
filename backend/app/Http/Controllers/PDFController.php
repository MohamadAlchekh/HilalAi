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
        $response = $client->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={$apiKey}", [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'contents' => [
                    [
                        'parts' => [
                            [
                                'text' => "Summarize the following text and generate 3 questions (easy, medium, hard) based on it:\n\n{$text}"
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
        return $data['candidates'][0]['content']['parts'][0]['text'];
    } catch (\Exception $e) {
        return 'Error calling Gemini API: ' . $e->getMessage();
    }
}   
}