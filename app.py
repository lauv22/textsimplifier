"""
Flask web app for the text simplifier.
Wraps simplify_text() and compare_readability() from simplify.py in a
simple web UI with before/after readability comparison.
"""



app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/simplify", methods=["POST"])
def api_simplify():
    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()

    if not text:
        return jsonify({"error": "Please enter some text to simplify."}), 400

    if len(text) > 2000:
        return jsonify({"error": "Please keep input under 2000 characters."}), 400

    simplified = simplify_text(text)
    scores = compare_readability(text, simplified)

    return jsonify({
        "original": text,
        "simplified": simplified,
        "scores": scores,
    })


if __name__ == "__main__":
    app.run(debug=True, port=5000)
