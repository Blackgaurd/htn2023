function getPrompt(input) {
	return `### Instruction ###
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
}

const TESTING_DISEASES = [
    {
        name: 'COVID-19',
        why: 'The patient has a fever, cough, and shortness of breath. These are all symptoms of COVID-19.',
        next: 'The patient should self-isolate and get tested for COVID-19.',
        confidence: '100%'
    },
    {
        name: 'Common Cold',
        why: 'The patient has a runny nose and sore throat. These are all symptoms of the common cold.',
        next: 'The patient should rest and drink plenty of fluids.',
        confidence: '80%'
    },
    {
        name: 'Bronchitis',
        why: 'The patient has a persistent cough with mucus, chest discomfort, and occasional fever.',
        next: 'The patient should rest, drink fluids, and consider a cough syrup or expectorant.',
        confidence: '75%'
    },
    {
        name: 'Strep Throat',
        why: 'The patient has a severe sore throat, difficulty swallowing, and swollen tonsils. These are symptoms of strep throat.',
        next: 'The patient should see a doctor for a throat swab and antibiotics if confirmed.',
        confidence: '85%'
    },
    {
        name: 'Asthma',
        why: 'The patient experiences wheezing, shortness of breath, and chest tightness, especially during physical activity or exposure to allergens.',
        next: 'The patient should use their prescribed inhaler and avoid triggers.',
        confidence: '70%'
    },
    {
        name: 'Gastroenteritis',
        why: 'The patient has diarrhea, vomiting, and abdominal cramps, typically after consuming contaminated food or water.',
        next: 'The patient should stay hydrated and may need antiemetic medication if severe.',
        confidence: '80%'
    },
    {
        name: 'Urinary Tract Infection (UTI)',
        why: 'The patient experiences frequent urination, burning sensation while urinating, and lower abdominal pain.',
        next: 'The patient should see a doctor for a urine test and antibiotics if confirmed.',
        confidence: '85%'
    },
    {
        name: 'Migraine',
        why: 'The patient has recurrent severe headaches, often accompanied by nausea and sensitivity to light or sound.',
        next: 'The patient should rest in a quiet, dark room and consider a prescribed migraine medication.',
        confidence: '75%'
    },
    {
        name: 'Rheumatoid Arthritis',
        why: 'The patient has joint pain, swelling, and stiffness, particularly in the morning or after periods of rest.',
        next: 'The patient should see a rheumatologist for diagnosis and treatment options.',
        confidence: '80%'
    },
    {
        name: 'Hypertension (High Blood Pressure)',
        why: 'The patient consistently has elevated blood pressure readings during check-ups.',
        next: 'The patient should make lifestyle changes, such as diet and exercise, and may need medication.',
        confidence: '70%'
    },
    {
        name: 'Anxiety Disorder',
        why: 'The patient experiences excessive worry, restlessness, and physical symptoms like increased heart rate and sweating.',
        next: 'The patient should consult a mental health professional for therapy and possible medication.',
        confidence: '75%'
    },
    {
        name: 'Gout',
        why: 'The patient has sudden and severe joint pain, typically in the big toe, along with redness and swelling.',
        next: 'The patient should see a doctor for a diagnosis and may need medication to manage gout attacks.',
        confidence: '80%'
    }
];

export async function generateCohere(prompt) {
    let req = null;
    try {
        req = await fetch('https://api.cohere.ai/v1/generate', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer pKcjgYfSVd5fProxLQJBDFqvRqV40s0indj1CZOF'
            },
            body: JSON.stringify({
                prompt: prompt,
                model: 'command',
                max_tokens: 400,
                temperature: 0
            })
        });
    } catch (e) {
        throw new Error(`Cohere API error: ${e.message}`);
    }
    const res = (await req.json()).generations[0].text;
    return res;
}

/**
 * real documentation
 * @param input the user's input (string)
 * @returns {Promise<*[]>} promise of an array of objects of the form {name, why, next, confidence}
 */
export default async function queryCohere(input, testing = false) {
	if (testing) {
		console.log('TESTING MODE');
		await new Promise((resolve) => setTimeout(resolve, 1000));
		return TESTING_DISEASES;
	}

	console.log('PRODUCTION MODE');
	const prompt = getPrompt(input);
    const res = await generateCohere(prompt);

    const ans = [];
	const illnesses = res.split('\n\n');
	illnesses.length--; //bandaid solution to output truncation

	for (const illness of illnesses) {
		const lines = illness.split('\n');
		ans.push({
			name: lines[0].split('NAME: ')[1],
			why: lines[1].split('WHY: ')[1],
			next: lines[2].split('NEXT: ')[1],
			confidence: lines[3].split('CONFIDENCE: ')[1]
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
