from datetime import timedelta
from dotenv import load_dotenv
import os
from openai import OpenAI

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

client = OpenAI(api_key=OPENAI_API_KEY)

CONVERSATION_THRESHOLD = timedelta(hours=1)

MODEL = "gpt-4o-mini"
SYSTEM_PROMPT = """
Tu vas recevoir une demande d'analyse de conversation ou de recherche. reponds à la demande seulement à partir de son contenu et de ce que l'on te demande, n'invente rien
"""

CHUNK_RESUME_PROMPT = """
tu vas recevoir un morceau de conversation contigue, fais en un petit resume de ce qui a ete dit en tenant compte des messages,
 de qui les as envoyé, et en faisant particulierement attention aux elements articuliers tels que les nombres, les dates, les noms mentionnés etc
"""

SEARCH_PROMPT = """
tu vas recevoir une demande de recherche dans une conversation.
tu vas recevoir un morceau de conversation, representé par un 
"""

def get_resume(chunk:list[dict]):
    """
    Get a resume of a chunk of conversation using a llm
    """
    pass

def search_conversation(conversationid,query:str):
    """
    Search a conversation for a query
    """

    # search the conversation for the query
    # build a tring with the resume of each chunk of the conv
    resume = ""
    chunks = []
    for chunk in chunks:
        pass
    
    # search the conversation for the query
    



def analysis_conversation(conversation:list[dict]):
    """
    Analyze a conversation and return a summary of the conversation.
    """
    
    # sort by time
    conversation.sort(key=lambda x: x["date"])

    # separate the conversation into chunks of difference timedelta
    chunks = []
    for i in range(len(conversation)):
        if i == 0:
            chunks.append([conversation[i]])
        else:
            if conversation[i]["date"] - conversation[i-1]["date"] > CONVERSATION_THRESHOLD:
                chunks.append([conversation[i]])
            else:
                chunks[-1].append(conversation[i])

    # for each chunk, get a resume of the conversation using a llm

    for chunk in chunks:
        # get a resume of the conversation using a llm
        resume = get_resume(chunk)
        print(resume)




if __name__ == "__main__":
    conversation = [
        {"date": "2025-06-12:10:00", "content": "Hello, how are you?", "userid": "1"},
        {"date": "2025-06-12:10:01", "content": "I'm fine, thank you!", "userid": "2"},
        {"date": "2025-06-12:10:02", "content": "What's your name?", "userid": "1"},
        {"date": "2025-06-12:10:03", "content": "My name is John.", "userid": "2"},
        {"date": "2025-06-12:10:04", "content": "What's your name?", "userid": "1"},
    ]
    print(analysis_conversation(conversation))