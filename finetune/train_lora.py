"""
Train a small "voice" LoRA so OscarBot sounds like Oscar.

Facts still come from knowledge/ at answer time; this adapter only shapes tone.
Keep training data to answers that are true and that you're happy to see quoted.

Usage (GPU with ~16 GB for a 3B model in 4-bit):
    pip install unsloth trl datasets
    python train_lora.py --data data/voice.jsonl --out out/oscar-voice
    python train_lora.py --data data/voice.jsonl --out out/oscar-voice --gguf q4_k_m   # also export for Ollama
"""
import argparse

from unsloth import FastLanguageModel
from unsloth.chat_templates import train_on_responses_only
from datasets import load_dataset
from trl import SFTConfig, SFTTrainer

SYSTEM = (
    "You are OscarBot, the assistant on Oscar Yasunaga's personal website. "
    "Answer only from the provided context. If you don't know, say so."
)

p = argparse.ArgumentParser()
p.add_argument("--base", default="unsloth/Qwen2.5-3B-Instruct-bnb-4bit")
p.add_argument("--data", default="data/voice.jsonl")
p.add_argument("--out", default="out/oscar-voice")
p.add_argument("--rank", type=int, default=16)
p.add_argument("--epochs", type=float, default=2)
p.add_argument("--lr", type=float, default=2e-4)
p.add_argument("--max-len", type=int, default=2048)
p.add_argument("--gguf", default="", help="e.g. q4_k_m to also export a merged GGUF for Ollama")
args = p.parse_args()

model, tokenizer = FastLanguageModel.from_pretrained(
    model_name=args.base, max_seq_length=args.max_len, load_in_4bit=True
)
model = FastLanguageModel.get_peft_model(
    model,
    r=args.rank,
    lora_alpha=args.rank,
    lora_dropout=0.0,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
    use_gradient_checkpointing="unsloth",
    random_state=0,
)

ds = load_dataset("json", data_files=args.data, split="train")


def to_text(ex):
    msgs = ex["messages"]
    if msgs[0]["role"] != "system":
        msgs = [{"role": "system", "content": SYSTEM}] + msgs
    return {"text": tokenizer.apply_chat_template(msgs, tokenize=False)}


ds = ds.map(to_text, remove_columns=ds.column_names)
split = ds.train_test_split(test_size=0.1, seed=0) if len(ds) >= 20 else None

trainer = SFTTrainer(
    model=model,
    tokenizer=tokenizer,
    train_dataset=split["train"] if split else ds,
    eval_dataset=split["test"] if split else None,
    args=SFTConfig(
        dataset_text_field="text",
        max_seq_length=args.max_len,
        per_device_train_batch_size=4,
        gradient_accumulation_steps=2,
        num_train_epochs=args.epochs,
        learning_rate=args.lr,
        lr_scheduler_type="cosine",
        warmup_ratio=0.05,
        logging_steps=5,
        eval_strategy="epoch" if split else "no",
        save_strategy="no",
        output_dir=args.out,
        report_to="none",  # set to "wandb" to log
        seed=0,
    ),
)
# Only the assistant turns contribute to the loss (Qwen2.5 chat-template markers).
trainer = train_on_responses_only(
    trainer,
    instruction_part="<|im_start|>user\n",
    response_part="<|im_start|>assistant\n",
)
trainer.train()

model.save_pretrained(args.out)       # LoRA adapter only, for vLLM --lora-modules
tokenizer.save_pretrained(args.out)
print(f"Saved adapter to {args.out}")

if args.gguf:
    model.save_pretrained_gguf(f"{args.out}-gguf", tokenizer, quantization_method=args.gguf)
    print(f"Saved merged GGUF to {args.out}-gguf")
