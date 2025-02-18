# summarize
A lightweight model tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf has been deployed locally.
Model: TinyLlama-1.1B
Features:
- Parameters: 1.1 billion parameters, requires only 500MB~1GB of memory.
- Usage: General text generation, Q&A, summarization.
- Advantages: Optimized for low-resource devices, supports real-time inference on CPU.

# How to use this plugin:
## Enter the server folder and run
python server.py
## Activate the virtual environment
conda activate your_env
## Enter the llama.cpp source directory under /build/bin
./llama-server -m ~/models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf --host 0.0.0.0 --port 8081 -ngl 2

# Detailed installation steps are as follows

## 1. Environment confirmation
### 1.1 Ensure basic tools are installed
Install build dependencies (Ubuntu/Debian)
sudo apt-get update && sudo apt-get install -y build-essential cmake git
### 1.2 Enter the virtual environment (e.g., conda/venv)
Assume your virtual environment is named "llama-env"
conda activate llama-env  # conda environment
or
source venv/bin/activate  # venv environment

## 2. Compile llama.cpp
### 2.1 Clone the repository and compile
Clone the llama.cpp repository
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
Compile (for pure CPU, enable GPU acceleration if CUDA is installed)
mkdir build && cd build
cmake .. -DLLAMA_BLAS=ON -DLLAMA_BLAS_VENDOR=OpenBLAS
make -j4  # Adjust according to the number of CPU cores (e.g., -j8)
After compilation, the main program is in `build/bin/llama-cli`

## 3. Download the TinyLlama-1.1B quantized model
### 3.1 Download the GGUF format model
Choose the quantized version suitable for your hardware (Q4_K_M is recommended for balanced accuracy and speed):
Enter the model save directory (assumed to be ~/models)
mkdir -p ~/models && cd ~/models
Download the model (about 500MB)
wget https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf

## 4. Run the model
### 4.1 Basic interactive mode
Enter the build/bin directory of llama.cpp
cd /path/to/llama.cpp/build/bin
Run the model (pure CPU)
./llama-cli -m ~/models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf \
  --color \
  -i \  
  -r "User:" \  
  -p "User: Hello, introduce yourself"  

-m: Specify the model path.
-i: Enter interactive mode
--color: Enable colored output.
-r: Set user prompt.
-p: Initial prompt content.
-n parameter limits the maximum number of tokens generated.

### 4.2 Parameter optimization
Improve speed: Accelerate with multithreading (--threads N, N=number of CPU logical cores):
./llama-cli -m ~/models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf \
  --threads 4 \  # Adjust according to the number of CPU cores
  -p "User: How to learn Python?"
Limit memory: Add --mlock to lock memory (requires sufficient physical memory):
./llama-cli -m ~/models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf --mlock

5. Integrate into Python applications (optional)
If you need to call the model via Python, use the llama-cpp-python library:
# Install Python bindings
pip install llama-cpp-python
Example code
``` python
from llama_cpp import Llama

# Load the model
llm = Llama(
    model_path="~/models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf",
    n_ctx=512,  # Context length
    n_threads=4  # Number of threads
)

# Generate text
response = llm.create_chat_completion(
    messages=[{"role": "user", "content": "Write a poem about autumn"}],
    temperature=0.7,
    max_tokens=256
)

print(response['choices'][0]['message']['content'])
```

## 5. Use llama-server to start an HTTP server
Enter the build/bin directory
cd /path/to/llama.cpp/build/bin
Start the server
./llama-server -m ~/models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf --host 0.0.0.0 --port 8080
-m: Specify the model path.
--host: Bind IP address (0.0.0.0 means listening on all network interfaces).
--port: Bind port number (e.g., 8080).
Test API
curl http://localhost:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf",
    "messages": [{"role": "user", "content": "Hello, introduce yourself"}]
  }'

## 6. Enable GPU acceleration
After installing GPU drivers and CUDA, run:
nvcc -V
You should see the version information of the CUDA compiler.
### Enter the llama.cpp source directory and clean the previous build
make clean
### Enable CUDA backend during compilation (e.g., if your GPU supports CUDA and you have correctly installed the CUDA Toolkit):
LLAMA_CUBLAS=1 make
This will compile an executable that supports CUDA acceleration (note that CUDA support in llama.cpp depends on your GPU driver and CUDA environment configuration).

### Run the GPU version of llama.cpp
In the llama.cpp directory, specify GPU-related parameters when starting the model. For example:
./llama-cli -m ~/models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf -p "Hello" -ngl 2
The -ngl parameter (or --gpu-layers) is used to control the number of layers loaded onto the GPU. You can adjust this value according to your GPU memory.

## 7. Access via API
Once the server is started, you can interact with the model via HTTP POST requests. For example, using the curl command-line tool:
curl --request POST \
  --url http://localhost:8080/completion \
  --header "Content-Type: application/json" \
  --data '{"prompt": "What is the largest fish in the world?", "n_predict": 128}'

## 8. Error handling
If you encounter the following error:
main: couldn't bind HTTP server socket, hostname: 0.0.0.0, port: 8080
Port 8080 may be occupied by another process. You can check the port occupation with the following command:
sudo netstat -tuln | grep 8080

### Solution
Change the port: Change --port 8080 to another port (e.g., 8081):
./llama-server -m ./models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf --host 0.0.0.0 --port 8081
Terminate the occupying process: If you confirm that the port is occupied and the process is not needed, you can terminate it:
sudo lsof -i :8080  # View the process occupying the port
sudo kill -9 <PID>  # Terminate the process

## 9. Alternative model suggestions
If TinyLlama-1.1B is not sufficient, you can try the following models:
Phi-3-mini (3.8B) - Microsoft's lightweight model with stronger inference capabilities
Download link
https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf
Download the ggml format LLaMA model
mkdir llama_models
cd llama_models
wget https://huggingface.co/TheBloke/Llama-2-7B-GGML/resolve/main/llama-2-7b.ggmlv3.q4_0.bin
This file is a quantized version of LLaMA 2-7B, which can run on a PC with 8GB+ RAM.




