# llm_chain_manager.py
from langchain.prompts import ChatPromptTemplate
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains import create_retrieval_chain
from langchain_openai import ChatOpenAI # For type hinting
from langchain_chroma import Chroma # For type hinting
from langchain_core.runnables import Runnable # For type hinting the return type
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.runnables import RunnableLambda
from models import Recipe
def setup_rag_chain(llm: ChatOpenAI, vector_db: Chroma) -> Runnable:
    """
    Sets up the RAG (Retrieval Augmented Generation) chain.
    """
    retriever = vector_db.as_retriever(search_kwargs={"k": 5}) # Retrieve top 5 relevant documents
    parser = JsonOutputParser(pydantic_object=Recipe)

    system_prompt = """
    You are an expert chef and a helpful assistant. Your task is to provide detailed recipe recommendations.
    Based on the user's available ingredients and the context provided from the recipe database,
    create a complete and easy-to-follow recipe.

    Your response MUST be formatted as a JSON object, adhering to the following schema:
    {format_instructions}

    If the provided context is insufficient to create a full recipe, return a JSON object
    with 'recipe_name' as "Insufficient Information" and provide a message in 'chef_tip'
    explaining what information is needed or suggesting a simpler dish.

    Context:
    {context}
    """

    prompt_template = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{input}")
    ]).partial(format_instructions=parser.get_format_instructions())
    formated_prompt_template = prompt_template #.partial(format_instructions=parser.get_format_instructions())
    # This is where the chain is created
    first_chain = create_stuff_documents_chain(llm, formated_prompt_template)
    rag_chain = create_retrieval_chain(retriever, first_chain)
    final_chain = rag_chain | RunnableLambda(lambda x: x["answer"]) | parser
    return final_chain 