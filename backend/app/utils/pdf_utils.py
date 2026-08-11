from pypdf import PdfReader


def extract_text_from_pdf(file_path: str, max_chars: int = 12000) -> str:
    reader = PdfReader(file_path)
    text_parts = []
    for page in reader.pages:
        text_parts.append(page.extract_text() or "")
    full_text = "\n".join(text_parts)
    return full_text[:max_chars]
