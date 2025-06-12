import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPEN_AI_KEY"))

def gif_answer(conversation):
    """
    Analyze a conversation and return a text response based on the last message.
    """

    last_message = conversation[-1]['content']

    response = client.chat.completions.create(
        model="gpt-4o",  # or "gpt-4-turbo"
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": f"Conversation: {conversation}\n\nPlease respond to the last message: '{last_message}'"}
        ]
    )

    return response.choices[0].message.content


if __name__ == "__main__":
    conversation = [
        {"date": "2025-06-12", "content": "Happy birthday!", "userid": "1"},
    ]
    print(gif_answer(conversation))