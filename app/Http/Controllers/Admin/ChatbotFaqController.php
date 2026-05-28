<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ChatbotFaq;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChatbotFaqController extends Controller
{
    /**
     * Display chatbot FAQs list.
     */
    public function index(): Response
    {
        $faqs = ChatbotFaq::orderBy('urutan')->get();

        return Inertia::render('admin/chatbot/faqs', [
            'faqs' => $faqs,
        ]);
    }

    /**
     * Store new Chatbot FAQ.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'label' => 'required|string|max:100',
            'question' => 'required|string|max:255',
            'answer' => 'required|string',
            'is_popular' => 'required|boolean',
            'urutan' => 'required|integer',
        ]);

        ChatbotFaq::create($validated);

        activity('chatbot_faqs')
            ->causedBy(auth()->user())
            ->log('Menambahkan FAQ Chatbot baru: ' . $validated['label']);

        return redirect()->route('admin.chatbot.faqs.index')->with('success', 'FAQ Chatbot baru berhasil disimpan.');
    }

    /**
     * Update existing Chatbot FAQ.
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $faq = ChatbotFaq::findOrFail($id);

        $validated = $request->validate([
            'label' => 'required|string|max:100',
            'question' => 'required|string|max:255',
            'answer' => 'required|string',
            'is_popular' => 'required|boolean',
            'urutan' => 'required|integer',
        ]);

        $faq->update($validated);

        activity('chatbot_faqs')
            ->causedBy(auth()->user())
            ->log('Mengubah FAQ Chatbot: ' . $validated['label']);

        return redirect()->route('admin.chatbot.faqs.index')->with('success', 'FAQ Chatbot berhasil diperbarui.');
    }

    /**
     * Delete Chatbot FAQ.
     */
    public function destroy(int $id): RedirectResponse
    {
        $faq = ChatbotFaq::findOrFail($id);
        $label = $faq->label;
        $faq->delete();

        activity('chatbot_faqs')
            ->causedBy(auth()->user())
            ->log('Menghapus FAQ Chatbot: ' . $label);

        return redirect()->route('admin.chatbot.faqs.index')->with('success', 'FAQ Chatbot berhasil dihapus.');
    }

    /**
     * Reorder Chatbot FAQ position up/down.
     */
    public function reorder(Request $request, int $id): RedirectResponse
    {
        $request->validate([
            'direction' => 'required|in:up,down',
        ]);

        $faq = ChatbotFaq::findOrFail($id);
        $direction = $request->input('direction');

        if ($direction === 'up') {
            $swapFaq = ChatbotFaq::where('urutan', '<', $faq->urutan)
                ->orderBy('urutan', 'desc')
                ->first();
        } else {
            $swapFaq = ChatbotFaq::where('urutan', '>', $faq->urutan)
                ->orderBy('urutan', 'asc')
                ->first();
        }

        if ($swapFaq) {
            $oldUrutan = $faq->urutan;
            $faq->update(['urutan' => $swapFaq->urutan]);
            $swapFaq->update(['urutan' => $oldUrutan]);
        }

        return redirect()->route('admin.chatbot.faqs.index');
    }
}
