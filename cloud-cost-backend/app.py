from flask import Flask, jsonify
from flask_cors import CORS
import json

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS to allow frontend (React) access

# Load mock data from JSON file
with open("mock_data.json", "r") as f:
    mock_data = json.load(f)

# Default route (for testing)
@app.route('/')
def home():
    return " Cloud Cost Backend is running!"

# API route: returns all mock data
@app.route('/api/costs')
def get_costs():
    return jsonify(mock_data)

# API route: generate basic rule-based suggestions
@app.route('/api/suggestions')
def get_suggestions():
    suggestions = []
    for s in mock_data['services']:
        # Example basic rule logic
        if s['cost'] < 0.5:
            suggestions.append(f"💡 {s['name']} usage is low — consider stopping idle instances.")
        if s['cost'] > 2:
            suggestions.append(f"⚠️ {s['name']} is high — review usage or switch to lower tier.")

    # Add a static example suggestion
    suggestions.append(" All costs are within the free tier for testing.")
    return jsonify({"suggestions": suggestions})

# Run app
if __name__ == '__main__':
    app.run(debug=True)
