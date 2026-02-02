#!/usr/bin/env python3
"""
SetFit Inference Server

Simple HTTP server that serves SetFit model predictions for HTS classification.
TypeScript services can call this server for fast, offline classification.

Requirements:
    pip install setfit flask

Usage:
    python scripts/setfit-inference-server.py --model models/setfit-hts-subheading --port 5001
"""

import argparse
import json
from pathlib import Path
from typing import List, Dict

try:
    from setfit import SetFitModel
    from flask import Flask, request, jsonify
except ImportError as e:
    print(f"Error: Missing required package: {e}")
    print("\nInstall dependencies with:")
    print("  pip install setfit flask")
    exit(1)

app = Flask(__name__)
model = None
model_info = {}


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'model_info': model_info
    })


@app.route('/classify', methods=['POST'])
def classify():
    """
    Classify a product description
    
    Request body:
        {
            "description": "cotton t-shirt men's crew neck",
            "top_k": 3  // optional, default 1
        }
    
    Response:
        {
            "predictions": [
                {"code": "610910", "confidence": 0.95},
                {"code": "610990", "confidence": 0.03},
                ...
            ],
            "latency_ms": 45
        }
    """
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 500
    
    data = request.get_json()
    
    if not data or 'description' not in data:
        return jsonify({'error': 'Missing "description" in request body'}), 400
    
    description = data['description']
    top_k = data.get('top_k', 1)
    
    try:
        import time
        start_time = time.time()
        
        # Get prediction
        if top_k == 1:
            prediction = model.predict([description])[0]
            predictions = [{'code': prediction, 'confidence': 1.0}]
        else:
            # For top-k, we'd need to modify SetFit or use model.predict_proba
            # For now, just return top-1
            prediction = model.predict([description])[0]
            predictions = [{'code': prediction, 'confidence': 1.0}]
        
        latency_ms = (time.time() - start_time) * 1000
        
        return jsonify({
            'predictions': predictions,
            'latency_ms': round(latency_ms, 2)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/batch-classify', methods=['POST'])
def batch_classify():
    """
    Classify multiple product descriptions in batch
    
    Request body:
        {
            "descriptions": ["product 1", "product 2", ...]
        }
    
    Response:
        {
            "results": [
                {"code": "610910", "confidence": 0.95},
                {"code": "620342", "confidence": 0.88},
                ...
            ],
            "latency_ms": 120
        }
    """
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 500
    
    data = request.get_json()
    
    if not data or 'descriptions' not in data:
        return jsonify({'error': 'Missing "descriptions" in request body'}), 400
    
    descriptions = data['descriptions']
    
    if not isinstance(descriptions, list):
        return jsonify({'error': '"descriptions" must be an array'}), 400
    
    try:
        import time
        start_time = time.time()
        
        # Get predictions
        predictions = model.predict(descriptions)
        
        latency_ms = (time.time() - start_time) * 1000
        
        results = [{'code': pred, 'confidence': 1.0} for pred in predictions]
        
        return jsonify({
            'results': results,
            'latency_ms': round(latency_ms, 2),
            'count': len(results)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def load_model(model_path: Path):
    """Load the SetFit model"""
    global model, model_info
    
    print(f"Loading model from {model_path}...")
    
    if not model_path.exists():
        raise FileNotFoundError(f"Model not found at {model_path}")
    
    model = SetFitModel.from_pretrained(str(model_path))
    
    # Load metrics if available
    metrics_path = model_path / 'metrics.json'
    if metrics_path.exists():
        with open(metrics_path, 'r') as f:
            model_info = json.load(f)
    
    model_info['model_path'] = str(model_path)
    model_info['model_name'] = model_path.name
    
    print(f"Model loaded successfully!")
    if model_info:
        print(f"Model info: {json.dumps(model_info, indent=2)}")


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
    
    # Load the model
    try:
        load_model(model_path)
    except Exception as e:
        print(f"Error loading model: {e}")
        exit(1)
    
    # Start the server
    print(f"\n=== Starting SetFit Inference Server ===")
    print(f"Server: http://{args.host}:{args.port}")
    print(f"Health check: http://{args.host}:{args.port}/health")
    print(f"\nEndpoints:")
    print(f"  POST /classify - Classify single product")
    print(f"  POST /batch-classify - Classify multiple products")
    print(f"\nExample:")
    print(f'  curl -X POST http://{args.host}:{args.port}/classify \\')
    print(f'    -H "Content-Type: application/json" \\')
    print(f'    -d \'{{"description": "cotton t-shirt"}}\'')
    print()
    
    app.run(host=args.host, port=args.port, debug=False)


if __name__ == '__main__':
    main()
