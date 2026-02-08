#!/usr/bin/env python3
"""
SetFit Inference Server

HTTP server for SetFit model predictions. Supports both heading-level (4-digit)
and subheading-level (6-digit) models with real confidence scores via predict_proba.

Requirements:
    pip install "setfit==1.1.3" "transformers>=4.44,<5.0" flask

Usage:
    python scripts/setfit-inference-server.py --model models/setfit-hts-heading --port 5001
"""

import argparse
import json
import time
import numpy as np
from pathlib import Path
from typing import List, Dict, Optional

try:
    from setfit import SetFitModel
    from flask import Flask, request, jsonify
except ImportError as e:
    print(f"Error: Missing required package: {e}")
    print("\nInstall dependencies with:")
    print('  pip install "setfit==1.1.3" "transformers>=4.44,<5.0" flask')
    exit(1)

app = Flask(__name__)
model: Optional[SetFitModel] = None
model_info: Dict = {}
has_proba = False  # Whether predict_proba is available


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'has_confidence_scores': has_proba,
        'model_info': model_info,
    })


def _predict_with_confidence(texts: List[str], top_k: int = 1) -> List[List[Dict]]:
    """
    Get predictions with real confidence scores.
    Uses predict_proba when available, falls back to predict with confidence=1.0.
    """
    global has_proba

    if has_proba:
        try:
            # predict_proba returns a numpy array of shape (n_samples, n_classes)
            proba = model.predict_proba(texts)
            if isinstance(proba, np.ndarray):
                # Get class labels from the model
                labels = model.labels if hasattr(model, 'labels') else None

                results = []
                for row in proba:
                    # Get top-k indices sorted by probability descending
                    top_indices = np.argsort(row)[::-1][:top_k]
                    preds = []
                    for idx in top_indices:
                        code = labels[idx] if labels is not None else str(idx)
                        confidence = float(row[idx])
                        if confidence > 0.001:  # Skip negligible predictions
                            preds.append({'code': str(code), 'confidence': round(confidence, 4)})
                    results.append(preds)
                return results
        except Exception as e:
            # predict_proba failed — fall back to predict
            print(f"[WARN] predict_proba failed ({e}), falling back to predict")
            has_proba = False

    # Fallback: no confidence scores
    predictions = model.predict(texts)
    return [[{'code': str(pred), 'confidence': 1.0}] for pred in predictions]


@app.route('/classify', methods=['POST'])
def classify():
    """
    Classify a product description.

    Request:  {"description": "cotton t-shirt", "top_k": 3}
    Response: {"predictions": [{"code": "6109", "confidence": 0.92}, ...], "latency_ms": 45}
    """
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 500

    data = request.get_json()
    if not data or 'description' not in data:
        return jsonify({'error': 'Missing "description" in request body'}), 400

    description = data['description']
    top_k = min(data.get('top_k', 3), 10)  # Default to top-3, cap at 10

    try:
        start = time.time()
        results = _predict_with_confidence([description], top_k=top_k)
        latency_ms = (time.time() - start) * 1000

        return jsonify({
            'predictions': results[0],
            'latency_ms': round(latency_ms, 2),
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/batch-classify', methods=['POST'])
def batch_classify():
    """
    Classify multiple product descriptions.

    Request:  {"descriptions": ["product 1", "product 2", ...], "top_k": 1}
    Response: {"results": [{"code": "6109", "confidence": 0.92}, ...], "latency_ms": 120}
    """
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 500

    data = request.get_json()
    if not data or 'descriptions' not in data:
        return jsonify({'error': 'Missing "descriptions" in request body'}), 400

    descriptions = data['descriptions']
    if not isinstance(descriptions, list):
        return jsonify({'error': '"descriptions" must be an array'}), 400

    top_k = min(data.get('top_k', 1), 10)

    try:
        start = time.time()
        all_results = _predict_with_confidence(descriptions, top_k=top_k)
        latency_ms = (time.time() - start) * 1000

        # For backward compat, flatten to top-1 when top_k=1
        if top_k == 1:
            results = [r[0] if r else {'code': '', 'confidence': 0} for r in all_results]
        else:
            results = all_results

        return jsonify({
            'results': results,
            'latency_ms': round(latency_ms, 2),
            'count': len(results),
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def load_model(model_path: Path):
    """Load the SetFit model and detect capabilities."""
    global model, model_info, has_proba

    print(f"Loading model from {model_path}...")

    if not model_path.exists():
        raise FileNotFoundError(f"Model not found at {model_path}")

    model = SetFitModel.from_pretrained(str(model_path))

    # Check if predict_proba is available
    try:
        test_proba = model.predict_proba(["test"])
        has_proba = test_proba is not None and len(test_proba) > 0
    except Exception:
        has_proba = False

    # Load metrics if available
    metrics_path = model_path / 'metrics.json'
    if metrics_path.exists():
        with open(metrics_path, 'r') as f:
            model_info = json.load(f)

    # Auto-detect model type from directory name or metrics
    model_name = model_path.name
    training_level = model_info.get('training_level', 'unknown')
    if training_level == 'unknown':
        if 'heading' in model_name:
            training_level = 'heading'
        elif 'subheading' in model_name:
            training_level = 'subheading'

    model_info['model_path'] = str(model_path)
    model_info['model_name'] = model_name
    model_info['training_level'] = training_level
    model_info['has_proba'] = has_proba

    n_labels = len(model.labels) if hasattr(model, 'labels') and model.labels else 0

    print(f"✅ Model loaded!")
    print(f"   Type: {training_level} ({n_labels} labels)")
    print(f"   Confidence scores: {'yes (predict_proba)' if has_proba else 'no (hardcoded 1.0)'}")
    if model_info.get('accuracy'):
        print(f"   Training accuracy: {model_info['accuracy']*100:.1f}%")


def main():
    parser = argparse.ArgumentParser(description='SetFit Inference Server')
    parser.add_argument('--model', type=str, required=True,
                       help='Path to trained SetFit model directory')
    parser.add_argument('--port', type=int, default=5001,
                       help='Port to run server on (default: 5001)')
    parser.add_argument('--host', type=str, default='127.0.0.1',
                       help='Host to bind to (default: 127.0.0.1)')

    args = parser.parse_args()
    model_path = Path(args.model)

    try:
        load_model(model_path)
    except Exception as e:
        print(f"Error loading model: {e}")
        exit(1)

    print(f"\n{'='*50}")
    print(f"SetFit Inference Server")
    print(f"{'='*50}")
    print(f"URL:    http://{args.host}:{args.port}")
    print(f"Health: http://{args.host}:{args.port}/health")
    print(f"\nEndpoints:")
    print(f"  POST /classify       - Single product (supports top_k)")
    print(f"  POST /batch-classify - Multiple products")
    print(f"\nExample:")
    print(f'  curl -X POST http://{args.host}:{args.port}/classify \\')
    print(f'    -H "Content-Type: application/json" \\')
    print(f'    -d \'{{"description": "cotton t-shirt", "top_k": 3}}\'')
    print()

    app.run(host=args.host, port=args.port, debug=False)


if __name__ == '__main__':
    main()
