import cohere from "cohere-ai";
import dotenv from "dotenv";
dotenv.config();
cohere.init(process.env["API_KEY"]);
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

For each illness that the patient may have, output 4 bullet points in the below format:

- NAME: State the name of the diagnosed illness.
- WHY: Explain why the patient could have that illness in 2 sentences.
- NEXT: Detail potential next steps, in 1-2 sentences, such as giving a medication prescription. If medication is prescribed, be very specific and refer to the specific names of the medication.
- CONFIDENCE: Calculate the certainty of the diagnosis as a percentage (100% means definitely certain).

### Example Output ###

- NAME: Common cold
- WHY: Your eyes tearing up and having a runny nose are common symptoms of the common cold.
- NEXT: You can take over-the-counter medications such as ibuprofen or acetaminophen to help relieve your cold symptoms. You can also use saline nasal sprays to help with nasal congestion.
- CONFIDENCE: 90%

- NAME: Allergies
- WHY: Your eyes tearing up and having a runny nose can be caused by allergies.
- NEXT: You can take over-the-counter antihistamines to help relieve your allergy symptoms. You can also use saline nasal sprays to help with nasal congestion.
- CONFIDENCE: 80%
`;

    const res = (await cohere.generate({
        prompt: prompt,
        model: "command",
        max_tokens:400,
        temperature: 0.9
    })).body.generations[0].text;

    const ans = [];
    const illnesses = res.split("\n\n");
    for (const illness of illnesses) {
        const lines = illness.split("\n");
        ans.push({
            name: lines[0].split("NAME: ")[1],
            why: lines[1].split("WHY: ")[1],
            next: lines[2].split("NEXT: ")[1],
            confidence: lines[3].split("CONFIDENCE: ")[1]
        });
    }
    return ans;

}
