import json

INPUT_PATH = 'data/synthetic_multilabel_data.json'

with open(INPUT_PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

cleaned = []
for entry in data:
    cats = [c for c in entry['categories'] if c != 'NA']
    if cats:
        entry['categories'] = cats
        cleaned.append(entry)

with open(INPUT_PATH, 'w', encoding='utf-8') as f:
    json.dump(cleaned, f, ensure_ascii=False, indent=2)

print(f"Cleaned data saved to {INPUT_PATH}. {len(data) - len(cleaned)} entries removed.")