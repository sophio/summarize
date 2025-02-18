# summarize
在本地部署了一个极轻量级的模型tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf
模型：TinyLlama-1.1B
特点：
参数量：11 亿参数，仅需 500MB~1GB 内存。
用途：通用文本生成、问答、摘要。
优势：专为低资源设备优化，支持 CPU 实时推理。

## 1. 环境确认
### 1.1 确保已安装基础工具
安装编译依赖（Ubuntu/Debian）
sudo apt-get update && sudo apt-get install -y build-essential cmake git
### 1.2 进入虚拟环境（如 conda/venv）
假设你的虚拟环境名为 "llama-env"
conda activate llama-env  # conda 环境
或
source venv/bin/activate  # venv 环境
## 2. 编译 llama.cpp
### 2.1 克隆仓库并编译
克隆 llama.cpp 代码库
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
编译（启用 GPU 加速需安装 CUDA，此处以纯 CPU 为例）
mkdir build && cd build
cmake .. -DLLAMA_BLAS=ON -DLLAMA_BLAS_VENDOR=OpenBLAS
make -j4  # 根据 CPU 核心数调整（如 -j8）
编译完成后，主程序在 `build/bin/llama-cli`
## 3. 下载 TinyLlama-1.1B 量化模型
### 3.1 下载 GGUF 格式模型
选择适合你硬件的量化版本（推荐 Q4_K_M 平衡精度与速度）：
进入模型保存目录（假设为 ~/models）
mkdir -p ~/models && cd ~/models
下载模型（约 500MB）
wget https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf
## 4. 运行模型
### 4.1 基础交互模式
进入 llama.cpp 的 build/bin 目录
cd /path/to/llama.cpp/build/bin
运行模型（纯 CPU）
./llama-cli -m ~/models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf \
  --color \
  -i \  
  -r "User:" \  
  -p "User: 你好，介绍一下你自己"  

-m：指定模型路径。
-i : 进入交互模式
--color：启用彩色输出。
-r：设置用户提示符。
-p：初始提示内容。
-n 参数限制生成的最大 token 数。
### 4.2 参数优化
提升速度：通过多线程加速（--threads N，N=CPU 逻辑核心数）：
./llama-cli -m ~/models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf \
  --threads 4 \  # 根据 CPU 核心数调整
  -p "User: 如何学习Python？"
限制内存：添加 --mlock 锁定内存（需足够物理内存）：
./llama-cli -m ~/models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf --mlock
5. 集成到 Python 应用（可选）
若需通过 Python 调用模型，使用 llama-cpp-python 库：
# 安装 Python 绑定
pip install llama-cpp-python
示例代码
``` python
from llama_cpp import Llama

# 加载模型
llm = Llama(
    model_path="~/models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf",
    n_ctx=512,  # 上下文长度
    n_threads=4  # 线程数
)

# 生成文本
response = llm.create_chat_completion(
    messages=[{"role": "user", "content": "写一首关于秋天的诗"}],
    temperature=0.7,
    max_tokens=256
)

print(response['choices'][0]['message']['content'])
```
## 5.使用 llama-server 启动 HTTP 服务器
进入 build/bin 目录
cd /path/to/llama.cpp/build/bin
启动服务器
./llama-server -m ~/models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf --host 0.0.0.0 --port 8080
-m：指定模型路径。
--host：绑定 IP 地址（0.0.0.0 表示监听所有网络接口）。
--port：绑定端口号（如 8080）。
测试API
curl http://localhost:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf",
    "messages": [{"role": "user", "content": "你好，介绍一下你自己"}]
  }'
## 6.启用 GPU 加速
安装好GPU驱动和CUDA后，运行：
nvcc -V
应该可以看到 CUDA 编译器的版本信息。
### 进入 llama.cpp 源码目录，清理上次构建
make clean
### 编译时启用 CUDA 后端（例如，如果你的 GPU 支持 CUDA，并且你已经正确安装了 CUDA Toolkit）：
LLAMA_CUBLAS=1 make
这将编译出支持 CUDA 加速的可执行文件（注意，llama.cpp 的 CUDA 支持依赖于你的 GPU 驱动和 CUDA 环境配置）
### 运行 llama.cpp GPU 版
在 llama.cpp 目录下，启动模型时指定 GPU 相关参数。例如：
./llama-cli -m ~/models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf  -p "你好" -ngl 2
其中 -ngl 参数（或 --gpu-layers）用来控制加载到 GPU 的层数。你可以根据你的 GPU 显存情况调整这个数值。
## 7.通过 API 进行访问
一旦服务器启动，您可以通过 HTTP POST 请求与模型交互。例如，使用 curl 命令行工具：
curl --request POST \
  --url http://localhost:8080/completion \
  --header "Content-Type: application/json" \
  --data '{"prompt": "世界上最大的鱼是什么？", "n_predict": 128}'

## 报错
如果出现以下错误
main: couldn't bind HTTP server socket, hostname: 0.0.0.0, port: 8080
端口 8080 可能已被其他进程占用。你可以通过以下命令检查端口占用情况：
sudo netstat -tuln | grep 8080
### 解决方法
更换端口：将 --port 8080 改为其他端口（如 8081）：
./llama-server -m ./models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf --host 0.0.0.0 --port 8081
终止占用进程：如果确定端口被占用且不需要该进程，可以终止它：
sudo lsof -i :8080  # 查看占用端口的进程
sudo kill -9 <PID>  # 终止进程

## 替代方案建议
如果 TinyLlama-1.1B 效果不足，可尝试以下模型：
Phi-3-mini (3.8B) - 微软轻量级模型，推理能力更强
下载地址
https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf
下载 ggml 格式的 LLaMA 模型
mkdir llama_models
cd llama_models
wget https://huggingface.co/TheBloke/Llama-2-7B-GGML/resolve/main/llama-2-7b.ggmlv3.q4_0.bin
这个文件是量化版本的 LLaMA 2-7B，可运行在 8GB+ RAM 的 PC 上。




