"""
Text Simplifier - uses a pre-trained FLAN-T5 model to rewrite dense/academic
text into plain, easy-to-read language.
"""

from transformers import T5Tokenizer, T5ForConditionalGeneration
import textstat

MODEL_NAME = "google/flan-t5-base"

print(f"Loading {MODEL_NAME}... (first run downloads the model, may take a minute)")
tokenizer = T5Tokenizer.from_pretrained(MODEL_NAME)
model = T5ForConditionalGeneration.from_pretrained(MODEL_NAME)
print("Model loaded.\n")


def simplify_text(text: str, max_length: int = 256) -> str:
    prompt = f"Simplify this text for a general audience: {text}"
    inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=512)
    outputs = model.generate(
        **inputs,
        max_length=max_length,
        num_beams=4,
        early_stopping=True,
    )
    return tokenizer.decode(outputs[0], skip_special_tokens=True)
