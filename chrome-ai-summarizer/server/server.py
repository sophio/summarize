from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

LLAMA_SERVER_URL = "http://localhost:8081/completion"

@app.route('/summarize', methods=['POST'])
def summarize():
    data = request.json
    text = data.get('text', '')
    
    # Prepare the request to send to the llama.cpp server
    payload = {
        "prompt": f"Please summarize the following text:\n{text}\n\nSummary:",
        "n_predict": 512,
        "temperature": 0.3,
        "stop": []
    }
    
    # Call the llama.cpp server
    try:
        response = requests.post(LLAMA_SERVER_URL, json=payload)
        response.raise_for_status()
        result = response.json()
        summary = result.get('content', 'No summary available')
        return jsonify({'summary': summary})
    except Exception as e:
        print(f"An error occurred: {str(e)}")  # Log the error
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000) 