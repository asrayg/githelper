from flask import Flask, request, jsonify
from transformers import DistilBertTokenizerFast, DistilBertForQuestionAnswering, pipeline

app = Flask(__name__)

model_name = "distilbert-base-uncased"
tokenizer = DistilBertTokenizerFast.from_pretrained(model_name)
model = DistilBertForQuestionAnswering.from_pretrained(model_name)

qa_pipeline = pipeline('question-answering', model=model, tokenizer=tokenizer)

@app.route('/ask', methods=['POST'])
def ask():
    data = request.get_json()
    question = data.get('question')
    context = data.get('context')
    
    result = qa_pipeline(question=question, context=context)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
