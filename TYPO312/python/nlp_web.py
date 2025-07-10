import sys
import json
import logging
from pathlib import Path
import re
from collections import Counter
import base64

from flask import Flask, request, jsonify, render_template_string
import nltk
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.corpus import stopwords
from nltk.util import ngrams

# Gestion des dépendances optionnelles
try:
    import spacy
    SPACY_AVAILABLE = True
except ImportError:
    SPACY_AVAILABLE = False
    print("Spacy n'est pas installé. L'extraction d'entités nommées sera désactivée.")

try:
    from transformers import pipeline
    TRANSFORMERS_AVAILABLE = True
    sentiment_analyzer = pipeline("sentiment-analysis", model="nlptown/bert-base-multilingual-uncased-sentiment")
except ImportError:
    TRANSFORMERS_AVAILABLE = False
    print("Transformers n'est pas installé. L'analyse de sentiment sera limitée.")

app = Flask(__name__)

# Classe NLPAnalyzer inchangée (la même que dans ton code)
class NLPAnalyzer:
    def __init__(self):
        self.setup_logging()
        self.load_resources()

    def setup_logging(self):
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)

    def load_resources(self):
        self.load_nltk_resources()
        self.nlp = self.load_spacy()

    def load_nltk_resources(self):
        try:
            nltk.download('punkt', quiet=True)
            nltk.download('stopwords', quiet=True)
        except Exception as e:
            self.logger.warning(f"Impossible de télécharger les ressources NLTK: {str(e)}")

    def load_spacy(self):
        if SPACY_AVAILABLE:
            try:
                return spacy.load("fr_core_news_sm")
            except Exception as e:
                self.logger.warning(f"Impossible de charger spaCy: {str(e)}")
        return None

 # Méthode analyze_sentiment
    def analyze_sentiment(self, text):
        if TRANSFORMERS_AVAILABLE:
            result = sentiment_analyzer(text[:512])[0]
            return result['label']
        else:
            # Implémentation simplifiée de l'analyse de sentiment
            positive_words = set(['bon', 'excellent', 'super', 'génial', 'heureux'])
            negative_words = set(['mauvais', 'terrible', 'horrible', 'triste', 'déçu'])
            words = word_tokenize(text.lower(), language='french')
            sentiment_score = sum(1 for word in words if word in positive_words) - sum(1 for word in words if word in negative_words)
            if sentiment_score > 0:
                return "POSITIVE"
            elif sentiment_score < 0:
                return "NEGATIVE"
            else:
                return "NEUTRAL"

   def analyze_sentiment_distribution(self, text):
	    sentences = sent_tokenize(text, language='french')
	    sentiments = [self.analyze_sentiment(sentence) for sentence in sentences]
	    return {
	        "POSITIVE": sentiments.count("POSITIVE") / len(sentiments),
	        "NEGATIVE": sentiments.count("NEGATIVE") / len(sentiments),
	        "NEUTRAL": sentiments.count("NEUTRAL") / len(sentiments)
	    }



    def analyze_text(self, text):
        self.logger.info(f"Starting analysis of text: {text[:50]}...")
        
        result = {
            "sentiment": self.analyze_sentiment(text),
            "keyphrases": self.extract_keyphrases(text),
            "category": self.categorize_text(text),
            "named_entities": self.extract_named_entities(text),
            "readability_score": self.calculate_readability_score(text),
            "word_count": len(word_tokenize(text, language='french')),
            "sentence_count": len(sent_tokenize(text, language='french')),
            "language": "fr",
            "lexical_diversity": self.calculate_lexical_diversity(text),
            "top_n_grams": self.extract_top_n_grams(text),
            "semantic_coherence": self.calculate_semantic_coherence(text),
            "sentiment_distribution": self.analyze_sentiment_distribution(text)
        }
        
        result["average_sentence_length"] = result["word_count"] / result["sentence_count"] if result["sentence_count"] > 0 else 0

        self.logger.info(f"Analysis completed successfully. Result: {json.dumps(result)}")
        return result

    # Méthodes d'analyse identiques à celles de ton code...

analyzer = NLPAnalyzer()

# Page HTML simple pour les requêtes GET
html_template = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Suggestion Semantic Platform</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .container {
            text-align: center;
            padding: 20px;
            background-color: white;
            box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.1);
            border-radius: 10px;
        }
        h1 {
            color: #333;
        }
        p {
            color: #555;
        }
        code {
            background-color: #f9f9f9;
            padding: 2px 6px;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to suggestion.seostrategy.fr</h1>
        <p>This API is ready to analyze text content.</p>
        <h2>How to use the API:</h2>
        <p><strong>Input (POST to <code>/analyze</code>):</strong></p>
        <pre>
{
    "content": "text encoded in base64"
}
        </pre>
        <p>Send the text you want to analyze in base64 format in the "content" field.</p>
        <p><strong>Output (Example Response):</strong></p>
        <pre>
{
    "sentiment": "POSITIVE",
    "keyphrases": ["text", "analysis"],
    "category": "Non catégorisé",
    ...
}
        </pre>
        <p>The API will return the sentiment, keyphrases, named entities, readability score, word and sentence count, lexical diversity, and more.</p>
    </div>
</body>
</html>
"""

@app.route('/', methods=['GET'])
def home():
    # Affiche la page d'accueil pour les utilisateurs accédant directement à l'URL
    return render_template_string(html_template)

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    if not data or 'content' not in data:
        return jsonify({"error": "No text provided for analysis"}), 400

    text = data['content']
    try:
        text = base64.b64decode(text).decode('utf-8')
    except Exception as e:
        return jsonify({"error": f"Invalid base64 encoding: {str(e)}"}), 400

    try:
        analyzer.logger.info(f"Received text for analysis: {text[:50]}...")
        result = analyzer.analyze_text(text)
        return jsonify(result)
    except Exception as e:
        analyzer.logger.error(f"Error during analysis: {str(e)}")
        return jsonify({"error": f"Error during analysis: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)

