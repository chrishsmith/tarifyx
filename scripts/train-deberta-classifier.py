#!/usr/bin/env python3
"""
DeBERTa HTS Classifier Training Script

Fine-tunes DeBERTa-v3-base on CROSS rulings for production-grade HTS classification.
Uses LoRA (Low-Rank Adaptation) for efficient fine-tuning.

Requirements:
    pip install transformers datasets torch accelerate peft scikit-learn

Usage:
    python scripts/train-deberta-classifier.py [--level subheading] [--epochs 3]
"""

import json
import argparse
from pathlib import Path
from typing import List, Dict, Tuple
import time

try:
    from transformers import (
        AutoTokenizer,
        AutoModelForSequenceClassification,
        TrainingArguments,
        Trainer,
        DataCollatorWithPadding
    )
    from datasets import Dataset, DatasetDict
    from peft import LoraConfig, get_peft_model, TaskType
    import torch
    from sklearn.metrics import accuracy_score, precision_recall_fscore_support
    import numpy as np
except ImportError as e:
    print(f"Error: Missing required package: {e}")
    print("\nInstall dependencies with:")
    print("  pip install transformers datasets torch accelerate peft scikit-learn")
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


def prepare_dataset(
    rulings: List[Dict],
    target_level: str = 'subheading',
    tokenizer = None
) -> Tuple[Dataset, Dict[str, int], Dict[int, str]]:
    """
    Prepare dataset for DeBERTa training
    
    Args:
        rulings: List of CROSS ruling dictionaries
        target_level: 'chapter', 'heading', 'subheading', or 'full'
        tokenizer: HuggingFace tokenizer
    
    Returns:
        Dataset, label2id mapping, id2label mapping
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
        text = ruling['productDescription']
        hts_code = ruling['htsCodes'][0].replace('.', '').ljust(10, '0')
        label = hts_code[:code_length]
        
        texts.append(text)
        labels.append(label)
    
    # Create label mappings
    unique_labels = sorted(set(labels))
    label2id = {label: idx for idx, label in enumerate(unique_labels)}
    id2label = {idx: label for label, idx in label2id.items()}
    
    # Convert labels to IDs
    label_ids = [label2id[label] for label in labels]
    
    # Create dataset
    dataset = Dataset.from_dict({
        'text': texts,
        'label': label_ids
    })
    
    # Tokenize if tokenizer provided
    if tokenizer:
        def tokenize_function(examples):
            return tokenizer(
                examples['text'],
                padding=False,
                truncation=True,
                max_length=512
            )
        
        dataset = dataset.map(tokenize_function, batched=True)
    
    print(f"Dataset size: {len(dataset)}")
    print(f"Unique labels: {len(unique_labels)}")
    
    return dataset, label2id, id2label


def compute_metrics(eval_pred):
    """Compute metrics for evaluation"""
    predictions, labels = eval_pred
    predictions = np.argmax(predictions, axis=1)
    
    accuracy = accuracy_score(labels, predictions)
    precision, recall, f1, _ = precision_recall_fscore_support(
        labels, predictions, average='weighted', zero_division=0
    )
    
    return {
        'accuracy': accuracy,
        'precision': precision,
        'recall': recall,
        'f1': f1
    }


def train_deberta_model(
    train_dataset: Dataset,
    eval_dataset: Dataset,
    label2id: Dict[str, int],
    id2label: Dict[int, str],
    model_name: str = "microsoft/deberta-v3-base",
    output_dir: str = "models/deberta-hts-classifier",
    num_epochs: int = 3,
    batch_size: int = 16,
    learning_rate: float = 2e-5,
    use_lora: bool = True
):
    """
    Fine-tune DeBERTa model for HTS classification
    
    Args:
        train_dataset: Training dataset
        eval_dataset: Evaluation dataset
        label2id: Label to ID mapping
        id2label: ID to label mapping
        model_name: Base model name
        output_dir: Where to save the trained model
        num_epochs: Number of training epochs
        batch_size: Training batch size
        learning_rate: Learning rate
        use_lora: Use LoRA for efficient fine-tuning
    """
    print(f"\n=== Training DeBERTa Model ===")
    print(f"Base model: {model_name}")
    print(f"Training samples: {len(train_dataset)}")
    print(f"Evaluation samples: {len(eval_dataset)}")
    print(f"Number of classes: {len(label2id)}")
    print(f"Use LoRA: {use_lora}")
    
    # Load tokenizer
    print("\nLoading tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    
    # Load model
    print("Loading model...")
    model = AutoModelForSequenceClassification.from_pretrained(
        model_name,
        num_labels=len(label2id),
        id2label=id2label,
        label2id=label2id
    )
    
    # Apply LoRA if requested
    if use_lora:
        print("Applying LoRA configuration...")
        lora_config = LoraConfig(
            task_type=TaskType.SEQ_CLS,
            r=16,  # LoRA rank
            lora_alpha=32,
            lora_dropout=0.1,
            target_modules=["query_proj", "value_proj"]  # DeBERTa attention modules
        )
        model = get_peft_model(model, lora_config)
        model.print_trainable_parameters()
    
    # Data collator
    data_collator = DataCollatorWithPadding(tokenizer=tokenizer)
    
    # Training arguments
    training_args = TrainingArguments(
        output_dir=output_dir,
        num_train_epochs=num_epochs,
        per_device_train_batch_size=batch_size,
        per_device_eval_batch_size=batch_size * 2,
        learning_rate=learning_rate,
        weight_decay=0.01,
        evaluation_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,
        metric_for_best_model="accuracy",
        logging_steps=100,
        warmup_steps=500,
        fp16=torch.cuda.is_available(),  # Use mixed precision if GPU available
        report_to="none",  # Disable wandb/tensorboard
    )
    
    # Create trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=eval_dataset,
        tokenizer=tokenizer,
        data_collator=data_collator,
        compute_metrics=compute_metrics,
    )
    
    # Train
    print("\nTraining...")
    start_time = time.time()
    trainer.train()
    training_time = time.time() - start_time
    
    print(f"\nTraining completed in {training_time:.1f}s ({training_time/60:.1f} minutes)")
    
    # Evaluate
    print("\nEvaluating on test set...")
    metrics = trainer.evaluate()
    print(f"Test Accuracy: {metrics['eval_accuracy'] * 100:.2f}%")
    print(f"Test F1: {metrics['eval_f1']:.4f}")
    
    # Save model and tokenizer
    print(f"\nSaving model to {output_dir}...")
    trainer.save_model(output_dir)
    tokenizer.save_pretrained(output_dir)
    
    # Save metrics
    metrics_path = Path(output_dir) / 'metrics.json'
    with open(metrics_path, 'w') as f:
        json.dump(metrics, f, indent=2)
    
    # Save label mappings
    mappings_path = Path(output_dir) / 'label_mappings.json'
    with open(mappings_path, 'w') as f:
        json.dump({
            'label2id': label2id,
            'id2label': id2label
        }, f, indent=2)
    
    return trainer, metrics


def main():
    parser = argparse.ArgumentParser(description='Train DeBERTa HTS Classifier')
    parser.add_argument('--level', type=str, default='subheading',
                       choices=['chapter', 'heading', 'subheading', 'full'],
                       help='HTS code granularity to predict')
    parser.add_argument('--model', type=str, default='microsoft/deberta-v3-base',
                       help='Base model to fine-tune')
    parser.add_argument('--epochs', type=int, default=3,
                       help='Number of training epochs')
    parser.add_argument('--batch-size', type=int, default=16,
                       help='Training batch size')
    parser.add_argument('--learning-rate', type=float, default=2e-5,
                       help='Learning rate')
    parser.add_argument('--no-lora', action='store_true',
                       help='Disable LoRA (full fine-tuning)')
    parser.add_argument('--max-samples', type=int,
                       help='Limit training samples (for testing)')
    parser.add_argument('--test', action='store_true',
                       help='Run in test mode with small dataset')
    
    args = parser.parse_args()
    
    # Paths
    project_root = Path(__file__).parent.parent
    train_path = project_root / 'src' / 'data' / 'crossRulings.json'
    val_path = project_root / 'src' / 'data' / 'crossRulings-validation.json'
    test_path = project_root / 'src' / 'data' / 'crossRulings-test.json'
    output_dir = project_root / 'models' / f'deberta-hts-{args.level}'
    
    # Check if data exists
    if not train_path.exists():
        print(f"Error: Training data not found at {train_path}")
        print("Run: npx ts-node scripts/ingest-cross-rulings.ts")
        exit(1)
    
    # Test mode: use small subset
    max_samples = 100 if args.test else args.max_samples
    
    # Load tokenizer first
    print(f"Loading tokenizer from {args.model}...")
    tokenizer = AutoTokenizer.from_pretrained(args.model)
    
    # Load and prepare data
    train_rulings = load_cross_rulings(train_path, max_samples)
    train_dataset, label2id, id2label = prepare_dataset(
        train_rulings, args.level, tokenizer
    )
    
    # Load validation data
    if not val_path.exists():
        print("Warning: Validation data not found, using 10% of training data")
        split = train_dataset.train_test_split(test_size=0.1, seed=42)
        train_dataset = split['train']
        eval_dataset = split['test']
    else:
        val_rulings = load_cross_rulings(val_path)
        eval_dataset, _, _ = prepare_dataset(val_rulings, args.level, tokenizer)
    
    # Train the model
    trainer, metrics = train_deberta_model(
        train_dataset=train_dataset,
        eval_dataset=eval_dataset,
        label2id=label2id,
        id2label=id2label,
        model_name=args.model,
        output_dir=str(output_dir),
        num_epochs=args.epochs,
        batch_size=args.batch_size,
        learning_rate=args.learning_rate,
        use_lora=not args.no_lora
    )
    
    print(f"\n=== Training Complete ===")
    print(f"Model saved to: {output_dir}")
    print(f"Accuracy: {metrics['eval_accuracy'] * 100:.2f}%")
    print(f"\nTo use this model, integrate with the inference server or load directly in Python.")


if __name__ == '__main__':
    main()
