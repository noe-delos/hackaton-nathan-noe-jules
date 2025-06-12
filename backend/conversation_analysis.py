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
tu vas recevoir un morceau de conversation contigue, fais en un resume très très court de ce qui a ete dit en tenant compte des messages,
 de qui les as envoyé, et en faisant particulierement attention aux elements articuliers tels que les nombres, les dates, les noms mentionnés etc
"""

SEARCH_PROMPT = """
tu vas recevoir une demande de recherche dans une conversation.
tu vas recevoir un morceau de conversation, representé par un 
"""

async def get_conversations_ids():
    """
    Get all conversations ids
    """
    response = supabase_client.table("conversations").select("id").execute()
    return [conversation["id"] for conversation in response.data]

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

async def get_chunks(conversation_id:str):
    """
    Get the chunks of a conversation
    """
    response = supabase_client.table("chunks").select("chunks").eq("conversation_id", conversation_id).execute()
    return response.data[0]["chunks"]

async def search_conversation(query:str):
    """
    Search a conversation for a query
    """

    # search all conversations ids
    response = supabase_client.table("conversations").select("id").execute()
    conversations = response.data
    resume = ""
    for conversation_id in conversations:
        chunks = await get_chunks(conversation_id["id"])
        # build a tring with the resume of each chunk of the convos
        
        for chunk in chunks:
            resume += chunk["resume"]
        # search the conversation for the query
        
    response = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "system", "content": SYSTEM_PROMPT}, {"role": "user", "content": SEARCH_PROMPT + "\n\n" + resume + "\n\n" + query}]
        )
    print(response.choices[0].message.content)
    return response.choices[0].message.content
    


async def analysis_conversation(conversation_id:str):
    """
    Analyze a conversation and return a summary of the conversation.
    """
    
    # sort by time
    conversation = await get_conversation(conversation_id)
    conversation.sort(key=lambda x: x["date"])

    # separate the conversation into chunks of difference timedelta
    chunks = []
    for i in range(len(conversation)):
        if i == 0:
            chunks.append([conversation[i]])
        else:
            try:
                if datetime.strptime(conversation[i]["date"][:19], DATEFORMAT) - datetime.strptime(conversation[i-1]["date"][:19], DATEFORMAT) > CONVERSATION_THRESHOLD:
                    chunks.append([conversation[i]])
                else:
                    chunks[-1].append(conversation[i])
            except:
                pass


    # for each chunk, get a resume of the conversation using a llm
    chunks_resumes = []
    for chunk in chunks:
        # get a resume of the conversation using a llm
        resume = await get_resume(chunk)
        chunks_resumes.append({"resume": resume,"start_date": chunk[0]["date"],"message_id": chunk[0]["id"]})
        #put the cunksresume in supabase : 
    supabase_client.table("chunks").upsert({"conversation_id": conversationid, "chunks": chunks_resumes}).execute()






if __name__ == "__main__":
    # conversations ids 
    converations_ids = asyncio.run(get_conversations_ids())
    for conversationid in converations_ids:
        answer = asyncio.run(analysis_conversation(conversationid))
    question = "Que s'est il passé le 22 janvier"
    answer = asyncio.run(search_conversation(question))
    print(answer)