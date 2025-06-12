import json
import os
from openai import OpenAI
from dotenv import load_dotenv
import requests

load_dotenv()

def call_to_giphy(query):
    url = "https://api.giphy.com/v1/gifs/search"
    params = {
        "api_key": os.getenv("GIPHY_KEY"),
        "q": query,
        "limit": 1,
        "offset": 0,
        "rating": "g",
        "bundle": "messaging_non_clips"
    }
    response = requests.get(url, params=params)
    data = response.json().get('data', [])
    gifs = []
    for gif in data:
        gifs.append({
            'gif_url': gif['images']['original']['url'],
            'giphy_url': gif['url'],
            'embed_url': gif['embed_url']
        })
    return gifs

def gif_answer(conversation):
    """
    Analyze a conversation and return a text response based on the last message.
    """
    client = OpenAI(api_key=os.getenv("OPEN_AI_KEY"))

    last_message = conversation[-1]['content']

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": f"""Here is the conversation: {conversation}\n\n
            Please answer with a json containing the keywords to send to search the giphy API to answer the last message with a gif: '{last_message}'
            The JSON should be like this: {{"keywords": ["keyword1 keyword2 keyword3"]}}"""}
        ],
        response_format={"type": "json_object"}
    )

    json_response = json.loads(response.choices[0].message.content)
    giphy_response = call_to_giphy(json_response.get("keywords"))

    return giphy_response

if __name__ == "__main__":
    conversation = [
        {"date": "2025-06-12", "content": "Happy birthday!", "userid": "1"},
    ]
    print(gif_answer(conversation))