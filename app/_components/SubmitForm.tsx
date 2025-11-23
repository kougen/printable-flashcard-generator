"use client";

import {useState} from "react";

export default function SubmitForm() {
  const [words, setWords] = useState<string[]>([""]);
  const [excludeImages, setExcludeImages] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const addWord = () => setWords([...words, ""]);
  const updateWord = (i: number, v: string) => {
    const copy = [...words];
    copy[i] = v;
    setWords(copy);
  };

  const removeWord = (i: number) => {
    const copy = [...words];
    copy.splice(i, 1);
    if (copy.length === 0) copy.push("");
    setWords(copy);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const form = new FormData();

    for (const w of words) {
      if (w.trim() !== "") form.append("words", w);
    }

    const fileInput = (e.target as HTMLFormElement).elements.namedItem(
      "images"
    ) as HTMLInputElement;

    if (fileInput && fileInput.files) {
      for (const f of fileInput.files) {
        form.append("images", f);
      }
    }

    if (excludeImages) form.append("exclude_images", "true");

    setLoading(true);
    setResult(null);

    const res = await fetch("/api/generate-pdf", {
      method: "POST",
      body: form,
    });

    setLoading(false);

    if (!res.ok) {
      setResult({error: "PDF generation failed."});
      return;
    }

    const json = await res.json();
    setResult(json);
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Generate Flashcard PDFs</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="font-semibold">Words</label>
          {words.map((value, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={value}
                onChange={(e) => updateWord(i, e.target.value)}
                className="flex-1 border px-3 py-1 rounded"
                required
              />
              <button
                type="button"
                onClick={() => removeWord(i)}
                className="px-2 text-red-600"
              >
                ✕
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addWord}
            className="px-3 py-1 border rounded"
          >
            Add word
          </button>
        </div>

        <div className="space-y-2">
          <label className="font-semibold">Images</label>
          <input
            type="file"
            name="images"
            multiple
            accept="image/*"
            className="block"
          />
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={excludeImages}
            onChange={(e) => setExcludeImages(e.target.checked)}
          />
          Exclude images PDF
        </label>

        <button
          type="submit"
          className="px-4 py-2 bg-black text-white rounded"
        >
          {loading ? "Generating…" : "Generate PDF"}
        </button>
      </form>

      {result && (
        <div className="mt-6 space-y-2 border p-4 rounded">
          <h2 className="font-semibold">Result</h2>

          {"error" in result && (
            <p className="text-red-600">{result.error}</p>
          )}

          {"pdf_words_url" in result && (
            <p>
              <a
                href={result.pdf_words_url}
                target="_blank"
                className="text-blue-600 underline"
              >
                Download Words PDF
              </a>
            </p>
          )}

          {"pdf_images_url" in result && (
            <p>
              <a
                href={result.pdf_images_url}
                target="_blank"
                className="text-blue-600 underline"
              >
                Download Images PDF
              </a>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
