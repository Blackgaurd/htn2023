const chatHistory = [];
//limit msgs to 250 words and limit history to 10 msgs
export default async function prompt(input) {
    chatHistory.push({
        req: input
    });
    if (chatHistory.length > 10) {
        chatHistory.shift();
    }
    const prompt = `### Instruction ###
Chat with the patient to improve their mental health. Factor the chat history (which will be provided in the input) into the replies.

### Context ###

You are a therapist talking with one of your patients. They are telling you what happened during their day and potentially any emotions they felt. You are to give them uplifting/motivational comments, along with any practical advice that could alleviate their stress.

### Input Format ###

The input will be a JSON array containing JSON elements. The JSON elements will have the following information inside them:
{
    "req": "what the patient said",
    "res": "what you said in reply"
}

The JSON array will be sorted by chronological order; that is, the first element in the array will be the earliest message/reply pair in the conversation, and the last element will be the most recent message/reply pair.

The last element will only have a "req" field, and that is the current message that you must reply to.

### Input ###

${JSON.stringify(chatHistory)}

### Output Format ###

Output your response, in sentence form, to the message in the JSON array's last element's "req" field.

### Example Output Format ###

That's too bad. What went wrong?
`;
    let req = null;
     try {
         req = await fetch("https://api.cohere.ai/v1/generate", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer pKcjgYfSVd5fProxLQJBDFqvRqV40s0indj1CZOF"
            },
            body: JSON.stringify({
                prompt: prompt,
                model: "command",
                max_tokens: 400,
                temperature: 0
            })
        });
    } catch (e) {
        throw new Error(`Cohere API error: ${e.message}`);
    }
    const res = (await req.json()).generations[0].text;
     chatHistory[chatHistory.length - 1].res = res;
    return res;
}