from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

LLAMA_SERVER_URL = "http://localhost:8081/completion"

@app.route('/summarize', methods=['POST'])
def summarize():
 #   print("收到请求")  # 添加日志
    data = request.json
    text = data.get('text', '')
  #  print(f"要总结的文本: {text}")  # 添加日志
    
    # 准备发送给 llama.cpp 服务器的请求
    payload = {
        "prompt": f"请总结以下文本：\n{text}\n\n总结：",
        "n_predict": 512,
        "temperature": 0.3,
        "stop": []
    }
  #  print(f"发送给 llama.cpp 的请求: {payload}")  # 添加日志
    
    # 调用 llama.cpp 服务器
    try:
        response = requests.post(LLAMA_SERVER_URL, json=payload)
   #     print(f"llama.cpp 响应状态码: {response.status_code}")  # 添加日志
        response.raise_for_status()
        result = response.json()
   #     print(f"llama.cpp 响应内容: {result}")  # 添加日志
        summary = result.get('content', 'No summary available')
        return jsonify({'summary': summary})
    except Exception as e:
        print(f"发生错误: {str(e)}")  # 添加日志
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000) 