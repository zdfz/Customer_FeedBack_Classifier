import json
import os
from typing import List
from fastapi import FastAPI
from pydantic import BaseModel
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.pipeline import Pipeline
from langdetect import detect
import joblib
import pandas as pd
from sklearn.multiclass import OneVsRestClassifier
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from pyarabic.araby import strip_tashkeel, normalize_hamza, normalize_ligature
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.metrics import classification_report
from collections import Counter
from sklearn.utils import resample
from sklearn.model_selection import GridSearchCV

DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'synthetic_multilabel_data.json')
MODEL_PATH = 'model.joblib'

# Load data
def load_data():
    with open(DATA_PATH, encoding='utf-8') as f:
        data = json.load(f)
    df = pd.DataFrame(data)
    return df

def preprocess_text(text: str, lang: str) -> str:
    # Simple normalization, can be extended
    text = text.strip()
    if lang == 'ar':
        # Remove diacritics and normalize Arabic letters
        text = strip_tashkeel(text)
        text = normalize_hamza(text)
        text = normalize_ligature(text)
    return text

def detect_language(text: str) -> str:
    try:
        lang = detect(text)
        if lang == 'ar':
            return 'ar'
        return 'en'
    except Exception:
        return 'en'

def clean_and_balance_data(df):
    # Define valid categories
    valid_categories = set([
        'Company Reputation', 'Courier Behavior', 'Customer Service', 'Delay',
        'Operation', 'Payment', 'Positive Feedback', 'Shipment Condition'
    ])
    # Remove entries where categories is empty after cleaning
    df['categories'] = df['categories'].apply(lambda cats: [c for c in cats if c in valid_categories])
    df = df[df['categories'].map(len) > 0].reset_index(drop=True)
    # Upsample underrepresented categories
    min_count = 200  # Target minimum per category
    dfs = [df]
    for cat in ['Delay', 'Positive Feedback']:
        cat_df = df[df['categories'].apply(lambda x: cat in x)]
        if len(cat_df) > 0 and len(cat_df) < min_count:
            upsampled = resample(cat_df, replace=True, n_samples=min_count - len(cat_df), random_state=42)
            dfs.append(upsampled)
    df = pd.concat(dfs).reset_index(drop=True)
    # Debug print: show category counts after cleaning
    all_cats = [cat for cats in df['categories'] for cat in cats]
    print('Category counts after cleaning:', Counter(all_cats))
    return df

# Train model
def train_model():
    df = load_data()
    df = clean_and_balance_data(df)
    X = [preprocess_text(t, l) for t, l in zip(df['text'], df['language'])]
    y = df['categories']
    mlb = MultiLabelBinarizer()
    Y = mlb.fit_transform(y)
    # Hyperparameter tuning for XGBoost
    param_grid = {
        'clf__estimator__n_estimators': [100],
        'clf__estimator__max_depth': [3],
        'clf__estimator__learning_rate': [0.1],
        'clf__estimator__subsample': [1.0],
        'clf__estimator__colsample_bytree': [1.0]
    }
    base_clf = OneVsRestClassifier(XGBClassifier(random_state=42, eval_metric="logloss"))
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(max_features=3000, ngram_range=(1,2), sublinear_tf=True)),
        ('clf', base_clf)
    ])
    grid = GridSearchCV(pipeline, param_grid, scoring='f1_micro', n_jobs=-1, cv=3)
    grid.fit(X, Y)
    print('Best params:', grid.best_params_)
    joblib.dump({'pipeline': grid.best_estimator_, 'mlb': mlb}, MODEL_PATH)
    print('Model trained and saved.')

# API
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow all. For production, specify your frontend URL.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictRequest(BaseModel):
    text: str

class PredictResponse(BaseModel):
    categories: List[str]
    language: str

if not os.path.exists(MODEL_PATH):
    train_model()

model_bundle = joblib.load(MODEL_PATH)
pipeline = model_bundle['pipeline']
mlb = model_bundle['mlb']

@app.post('/predict', response_model=PredictResponse)
def predict(req: PredictRequest):
    lang = detect_language(req.text)
    text = preprocess_text(req.text, lang)
    proba = pipeline.predict_proba([text])[0]
    # Set threshold to 0.20 for multi-label assignment
    pred = (proba >= 0.20).astype(int)
    cats = mlb.inverse_transform(np.array([pred]))[0]
    # If input is very short, return only the top-1 category (if any)
    if (len(req.text.split()) <= 3 or len(req.text) <= 10) and len(proba) > 0:
        top_idx = proba.argmax()
        if proba[top_idx] >= 0.20:
            cats = [mlb.classes_[top_idx]]
        else:
            cats = []
    return PredictResponse(categories=list(cats), language='Arabic' if lang == 'ar' else 'English')

@app.get('/')
def root():
    return {'message': 'Text Classification API is running.'}

def evaluate_model():
    df = load_data()
    df = clean_and_balance_data(df)
    X = [preprocess_text(t, l) for t, l in zip(df['text'], df['language'])]
    y = df['categories']
    Y_true = mlb.transform(y)
    Y_pred = pipeline.predict(X)
    report = classification_report(Y_true, Y_pred, target_names=mlb.classes_, zero_division=0, output_dict=False)
    print(report)
    return report

@app.get('/evaluate')
def evaluate():
    return {"report": evaluate_model()} 

