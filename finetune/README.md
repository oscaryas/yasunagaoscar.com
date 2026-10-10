# OscarBot: local model, voice LoRA, and deployment

OscarBot gets its facts from `knowledge/*.md` on every question. A fine-tuned LoRA only changes how it
sounds, so you can skip fine-tuning entirely and still have a working chat.

## 1. Run locally with a stock model (no fine-tuning)
```bash
# install Ollama from ollama.com, then:
ollama pull qwen2.5:3b-instruct
# in .env
LLM_BASE_URL=http://localhost:11434/v1
LLM_MODEL=qwen2.5:3b-instruct
```
Start the site with `npm start` and open `/llm-test/`.

## 2. Train a voice LoRA
1. Copy `data/voice.example.jsonl` to `data/voice.jsonl` and write 100 to 300 question/answer pairs in your own voice.
   Every answer must be something you're fine seeing screenshotted. Include plenty of "I don't know, ask Oscar"
   answers so the model learns to decline instead of inventing.
2. Train on a GPU (Colab, your cluster, or a rented GPU):
   ```bash
   pip install unsloth trl datasets
   python train_lora.py --data data/voice.jsonl --out out/oscar-voice --gguf q4_k_m
   ```
   On SLURM, wrap that line in your usual `sbatch` script.

The base model defaults to Qwen2.5-3B-Instruct. Use `--base` for another Unsloth model, and change
`instruction_part` and `response_part` in the script if its chat template isn't Qwen's.

## 3. Serve the LoRA locally with Ollama
```bash
ollama create oscarbot -f Modelfile
# in .env
LLM_MODEL=oscarbot
```
Check the GGUF filename in `out/oscar-voice-gguf/` matches the `FROM` line in `Modelfile`.

## 4. Deploy
The site only needs an OpenAI-compatible `/v1/chat/completions` URL, so deployment is a `.env` change.

**vLLM with the adapter** (any GPU host: RunPod, Modal, Lambda, your own box):
```bash
pip install vllm
vllm serve Qwen/Qwen2.5-3B-Instruct \
  --enable-lora --lora-modules oscar-voice=./out/oscar-voice \
  --max-model-len 4096 --api-key YOUR_KEY
```
```bash
LLM_BASE_URL=https://your-gpu-host:8000/v1
LLM_MODEL=oscar-voice
LLM_API_KEY=YOUR_KEY
```
Train on the non-quantized base name here (`--base unsloth/Qwen2.5-3B-Instruct`) if you want the adapter to match
vLLM's full-precision base exactly.

**Options compared**
| Option | Cost at personal-site traffic | Catch |
|---|---|---|
| Serverless GPU with scale-to-zero | Low, pay per second | First reply after idle can take 10 to 60+ s |
| Always-on GPU | High | Mostly idle |
| CPU box running the GGUF in Ollama | Low | A few words per second |
| Hosted API with a stock model | Very low | Not your fine-tuned model |

## Safety settings already in the backend
- 20 chat messages per IP per 10 minutes, and `CHAT_DAILY_CAP` messages per day in total.
- Questions capped at 800 characters and 8 turns of history.
- The system prompt restricts answers to the retrieved context.
- Every question and answer is logged to the `chat_log` table, so you can review what it says.

Also set a spending limit on whichever GPU or API provider you use.
