from datetime import datetime, timedelta
from dotenv import load_dotenv
import os
from openai import OpenAI
from supabase import create_client
import asyncio

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

DATEFORMAT = "%Y-%m-%dT%H:%M:%SZ"

print(SUPABASE_URL,SUPABASE_KEY)
print(OPENAI_API_KEY)

supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)

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

async def get_conversation(conversationid:str):
    """
    Get a conversation from the supabase database
    """
    
    response = supabase_client.table("conversations").select("messages").eq("id", conversationid).execute()
    return response.data[0]["messages"]

async def get_resume(chunk:list[dict]):
    """
    Get a resume of a chunk of conversation using a llm
    """

    # build a string with the conversation
    conversation_string = ""
    for message in chunk:
        print(message)
        conversation_string += f"{message['date']}: {message['user_id']}: {message['content']}\n"

    response = client.chat.completions.create(
        model=MODEL,  # or "gpt-4-turbo"
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": CHUNK_RESUME_PROMPT + "\n\n" + conversation_string}
        ]
    )
    return response.choices[0].message.content

async def search_conversation(query:str):
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
    



async def analysis_conversation(conversation:list[dict]):
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
            if datetime.strptime(conversation[i]["date"], DATEFORMAT) - datetime.strptime(conversation[i-1]["date"], DATEFORMAT) > CONVERSATION_THRESHOLD:
                chunks.append([conversation[i]])
            else:
                chunks[-1].append(conversation[i])


    # for each chunk, get a resume of the conversation using a llm
    chunks_resumes = []
    for chunk in chunks:
        # get a resume of the conversation using a llm
        resume = await get_resume(chunk)
        chunks_resumes.append({"resume": resume,"start_date": chunk[0]["date"],"message_id": chunk[0]["id"]})
        #put the cunksresume in supabase : 
    supabase_client.table("chunks").upsert({"conversation_id": conversationid, "chunks": chunks_resumes}).execute()






if __name__ == "__main__":
    conversationid = "62c50f8f-41a8-46be-be36-964653388e4e"
    conversation = asyncio.run(get_conversation(conversationid))
    print(conversation)
    answer = asyncio.run(analysis_conversation(conversation))
    print(answer)