<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Doc;
use App\Services\UploadedFileProcessor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DocApiController extends Controller
{
    public function __construct(private readonly UploadedFileProcessor $fileProcessor)
    {
    }

    public function index()
    {
        $docs = Doc::where('user_id', Auth::id())->latest()->get();

        return Inertia::render('Docs/Index', [
            'docs' => $docs,
        ]);
    }

    public function create()
    {
        return Inertia::render('Docs/Create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'nullable|string|max:255',
            'file'  => 'required|file|mimes:pdf,doc,docx,png,jpg,jpeg|max:10240',
            'notes' => 'nullable|string|max:1000',
        ]);

        $stored = $this->fileProcessor->store($request->file('file'), 'docs');

        Doc::create([
            'space_id'  => $request->user()->spaces()->first()->id ?? null,
            'user_id'   => Auth::id(),
            'title'     => $data['title'] ?? pathinfo($request->file('file')->getClientOriginalName(), PATHINFO_FILENAME),
            'file_path' => $stored['path'],
            'notes'     => $data['notes'] ?? null,
        ]);

        return redirect()->route('docs.index')->with('success', 'Document uploaded successfully!');
    }

    public function edit($id)
    {
        $doc = Doc::where('user_id', Auth::id())->findOrFail($id);
        return Inertia::render('Docs/Edit', ['doc' => $doc]);
    }

    public function update(Request $request, $id)
    {
        $doc = Doc::where('user_id', Auth::id())->findOrFail($id);

        $data = $request->validate([
            'title' => 'nullable|string|max:255',
            'file'  => 'nullable|file|mimes:pdf,doc,docx,png,jpg,jpeg|max:10240',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($request->hasFile('file')) {
            Storage::disk('public')->delete($doc->file_path);
            $stored = $this->fileProcessor->store($request->file('file'), 'docs');
            $data['file_path'] = $stored['path'];
        }

        $doc->update($data);

        return redirect()->route('docs.index')->with('success', 'Document updated successfully!');
    }

    public function destroy($id)
    {
        $doc = Doc::where('user_id', Auth::id())->findOrFail($id);
        Storage::disk('public')->delete($doc->file_path);
        $doc->delete();

        return redirect()->route('docs.index')->with('success', 'Document deleted successfully!');
    }
}
