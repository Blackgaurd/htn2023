/**
 * real documentation
 * @param input the user's input (string)
 * @returns {Promise<*[]>} promise of an array of objects of the form {name, why, next, confidence}
 */
export default async function prompt(input) {
    const prompt = `### Instruction ###
Determine the illness, if any, that a patient is experiencing based on the context below, given the following symptoms that they have observed over the past few weeks. Strongly consider the possibility that the patient might not be ill. If an illness is very severe, recommend them to visit the hospital.

### Context ###
You are a doctor that will present your diagnosis to a patient who submitted their symptoms to us in the hopes of detcting illnesses. The patient already knows what (if any) long-term illnesses they have, so you are only diagnosing illnesses that have started recently based on the symptoms provided.

### Input ###

${input}

### Output Format ###

For each illness that the patient may have, output 4 bullet points in the below format EXACTLY:

- NAME: State the name of the diagnosed illness.
- WHY: Explain why the patient could have that illness in 2 sentences.
- NEXT: Detail potential next steps, in 1-2 sentences, such as giving a medication prescription. If medication is prescribed, be very specific and refer to the specific names of the medication.
- CONFIDENCE: Calculate the certainty of the diagnosis as a percentage (100% means definitely certain).

### Example Output Format ###

- NAME: x
- WHY: x
- NEXT: x
- CONFIDENCE: x%`;
    const req = await fetch("https://api.cohere.ai/v1/generate", {
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
    const res = (await req.json()).generations[0].text;

    const ans = [];
    const illnesses = res.split("\n\n");
    illnesses.length--; //bandaid solution to output truncation

    for (const illness of illnesses) {
        const lines = illness.split("\n");
        ans.push({
            name: lines[0].split("NAME: ")[1],
            why: lines[1].split("WHY: ")[1],
            next: lines[2].split("NEXT: ")[1],
            confidence: lines[3].split("CONFIDENCE: ")[1]
        });
    }
    const set = new Set();
    for (const illness of ans) {
        set.add(illness.name);
    }
    const realAns = [];
    for (const s of set) {
        realAns.push(ans.find((x) => x.name === s));
    }
    return realAns;

}
