#!/usr/bin/env python3
"""
SetFit HTS Classifier Training Script

Trains a SetFit model on CROSS rulings for fast, accurate HTS classification.
SetFit uses few-shot learning with sentence transformers for efficient training.

Requirements:
    pip install setfit datasets torch scikit-learn

Usage:
    python scripts/train-setfit-classifier.py [--max-samples N] [--test]
"""

import json
import argparse
from pathlib import Path
from typing import List, Dict, Tuple
import time

try:
    from setfit import SetFitModel, Trainer, TrainingArguments
    from datasets import Dataset
    from sklearn.metrics import accuracy_score, classification_report
    import torch
except ImportError as e:
    print(f"Error: Missing required package: {e}")
    print("\nInstall dependencies with:")
    print("  pip install setfit datasets torch scikit-learn")
    exit(1)


def load_cross_rulings(data_path: Path, max_samples: int = None) -> List[Dict]:
    """Load CROSS rulings from JSON file"""
    print(f"Loading rulings from {data_path}...")
    
    with open(data_path, 'r') as f:
        data = json.load(f)
    
    rulings = data['rulings']
    
    if max_samples:
        rulings = rulings[:max_samples]
    
    print(f"Loaded {len(rulings)} rulings")
    return rulings


def prepare_dataset(rulings: List[Dict], target_level: str = 'subheading') -> Dataset:
    """
    Prepare dataset for SetFit training
    
    Args:
        rulings: List of CROSS ruling dictionaries
        target_level: 'chapter' (2-digit), 'heading' (4-digit), 'subheading' (6-digit), or 'full' (10-digit)
    
    Returns:
        HuggingFace Dataset with 'text' and 'label' columns
    """
    print(f"Preparing dataset for {target_level} classification...")
    
    texts = []
    labels = []
    
    # Map to extract the right level of HTS code
    level_map = {
        'chapter': 2,
        'heading': 4,
        'subheading': 6,
        'full': 10
    }
    
    code_length = level_map.get(target_level, 6)
    
    for ruling in rulings:
        # Use product description as input text
        text = ruling['productDescription']
        
        # Extract HTS code at the target level
        hts_code = ruling['htsCodes'][0].replace('.', '').ljust(10, '0')
        label = hts_code[:code_length]
        
        texts.append(text)
        labels.append(label)
    
    # Create HuggingFace dataset
    dataset = Dataset.from_dict({
        'text': texts,
        'label': labels
    })
    
    # Get unique labels
    unique_labels = sorted(set(labels))
    print(f"Dataset size: {len(dataset)}")
    print(f"Unique labels: {len(unique_labels)}")
    
    return dataset, unique_labels


def train_setfit_model(
    train_dataset: Dataset,
    eval_dataset: Dataset = None,
    model_name: str = "sentence-transformers/all-MiniLM-L6-v2",
    output_dir: str = "models/setfit-hts-classifier",
    num_epochs: int = 1,
    batch_size: int = 16
) -> SetFitModel:
    """
    Train a SetFit model for HTS classification
    
    Args:
        train_dataset: Training dataset
        eval_dataset: Evaluation dataset (optional)
        model_name: Base sentence transformer model
        output_dir: Where to save the trained model
        num_epochs: Number of training epochs
        batch_size: Training batch size
    
    Returns:
        Trained SetFitModel
    """
    print(f"\n=== Training SetFit Model ===")
    print(f"Base model: {model_name}")
    print(f"Training samples: {len(train_dataset)}")
    if eval_dataset:
        print(f"Evaluation samples: {len(eval_dataset)}")
    
    # Initialize SetFit model
    print("\nInitializing model...")
    model = SetFitModel.from_pretrained(model_name)
    
    # Set up training arguments
    args = TrainingArguments(
        output_dir=output_dir,
        num_epochs=num_epochs,
        batch_size=batch_size,
        evaluation_strategy="epoch" if eval_dataset else "no",
        save_strategy="epoch",
        load_best_model_at_end=True if eval_dataset else False,
    )
    
    # Create trainer
    trainer = Trainer(
        model=model,
        args=args,
        train_dataset=train_dataset,
        eval_dataset=eval_dataset,
    )
    
    # Train the model
    print("\nTraining...")
    start_time = time.time()
    trainer.train()
    training_time = time.time() - start_time
    
    print(f"\nTraining completed in {training_time:.1f}s ({training_time/60:.1f} minutes)")
    
    # Save the model
    print(f"Saving model to {output_dir}...")
    model.save_pretrained(output_dir)
    
    return model


def evaluate_model(model: SetFitModel, test_dataset: Dataset) -> Dict:
    """
    Evaluate the trained model on test data
    
    Args:
        model: Trained SetFitModel
        test_dataset: Test dataset
    
    Returns:
        Dictionary with evaluation metrics
    """
    print(f"\n=== Evaluating Model ===")
    print(f"Test samples: {len(test_dataset)}")
    
    # Make predictions
    print("Making predictions...")
    start_time = time.time()
    predictions = model.predict(test_dataset['text'])
    inference_time = time.time() - start_time
    
    # Calculate metrics
    accuracy = accuracy_score(test_dataset['label'], predictions)
    
    print(f"\nResults:")
    print(f"  Accuracy: {accuracy * 100:.2f}%")
    print(f"  Avg inference time: {(inference_time / len(test_dataset)) * 1000:.1f}ms per sample")
    print(f"  Total inference time: {inference_time:.2f}s")
    
    # Print detailed classification report (limit to avoid spam)
    unique_labels = sorted(set(test_dataset['label']))
    if len(unique_labels) <= 50:
        print("\nDetailed Classification Report:")
        print(classification_report(test_dataset['label'], predictions, zero_division=0))
    
    return {
        'accuracy': accuracy,
        'total_samples': len(test_dataset),
        'inference_time_ms': (inference_time / len(test_dataset)) * 1000,
        'total_time_s': inference_time
    }


def main():
    parser = argparse.ArgumentParser(description='Train SetFit HTS Classifier')
    parser.add_argument('--max-samples', type=int, help='Limit training samples (for testing)')
    parser.add_argument('--level', type=str, default='subheading', 
                       choices=['chapter', 'heading', 'subheading', 'full'],
                       help='HTS code granularity to predict')
    parser.add_argument('--test', action='store_true', help='Run in test mode with small dataset')
    parser.add_argument('--model', type=str, default='sentence-transformers/all-MiniLM-L6-v2',
                       help='Base sentence transformer model')
    parser.add_argument('--epochs', type=int, default=1, help='Number of training epochs')
    
    args = parser.parse_args()
    
    # Paths
    project_root = Path(__file__).parent.parent
    train_path = project_root / 'src' / 'data' / 'crossRulings.json'
    val_path = project_root / 'src' / 'data' / 'crossRulings-validation.json'
    test_path = project_root / 'src' / 'data' / 'crossRulings-test.json'
    output_dir = project_root / 'models' / f'setfit-hts-{args.level}'
    
    # Check if data exists
    if not train_path.exists():
        print(f"Error: Training data not found at {train_path}")
        print("Run: npx ts-node scripts/ingest-cross-rulings.ts")
        exit(1)
    
    # Test mode: use small subset
    max_samples = 100 if args.test else args.max_samples
    
    # Load data
    train_rulings = load_cross_rulings(train_path, max_samples)
    
    # Prepare datasets
    train_dataset, unique_labels = prepare_dataset(train_rulings, args.level)
    
    # Load validation data if available
    eval_dataset = None
    if val_path.exists():
        val_rulings = load_cross_rulings(val_path)
        eval_dataset, _ = prepare_dataset(val_rulings, args.level)
    
    # Train the model
    model = train_setfit_model(
        train_dataset=train_dataset,
        eval_dataset=eval_dataset,
        model_name=args.model,
        output_dir=str(output_dir),
        num_epochs=args.epochs,
        batch_size=16
    )
    
    # Evaluate on test set if available
    if test_path.exists():
        test_rulings = load_cross_rulings(test_path)
        test_dataset, _ = prepare_dataset(test_rulings, args.level)
        metrics = evaluate_model(model, test_dataset)
        
        # Save metrics
        metrics_path = output_dir / 'metrics.json'
        with open(metrics_path, 'w') as f:
            json.dump(metrics, f, indent=2)
        print(f"\nMetrics saved to {metrics_path}")
    
    print(f"\n=== Training Complete ===")
    print(f"Model saved to: {output_dir}")
    print(f"\nTo use this model in TypeScript, call the inference server:")
    print(f"  python scripts/setfit-inference-server.py --model {output_dir}")


if __name__ == '__main__':
    main()
