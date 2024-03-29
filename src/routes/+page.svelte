<script>
	import { fade } from 'svelte/transition';
	import queryCohere from '../lib/cohere.js';
	import getTherapy from '../lib/therapy.js';

	let TESTING = true;
	let therapistMode = false;

	let symptoms = [
		'Fever',
		'Headache',
		'Cough',
		'Fatigue',
		'Sore throat',
		'Nausea',
		'Shortness of breath'
	];

	let avatar, fileinput;

	const onFileSelected = (e) => {
		let image = e.target.files[0];
		let reader = new FileReader();
		reader.readAsDataURL(image);
		reader.onload = (e) => {
			avatar = e.target.result;
			// Upload the image to Flask
			uploadImageToFlask(image);
		};
	};

	function removeImage() {
		avatar = null;
	}

	async function uploadImageToFlask(image) {
		const formData = new FormData();
		formData.append('image', image);

		try {
			const response = await fetch('http://127.0.0.1:5000//upload', {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				// Handle the response from Flask here
				const captions = await response.json();
				console.log(captions);
				symptomInput = captions[0].generated_text;
			} else {
				console.error('Error uploading image');
			}
		} catch (error) {
			console.error('Error:', error);
		}
	}

	let hideOutput = true;
	let queryPromise = null;
	let symptomInput = '';
	function addSymptom(symptom) {
		if (symptomInput === '') {
			symptomInput = symptom;
		} else {
			symptomInput += `, ${symptom.toLowerCase()}`;
		}
	}
	async function search() {
		if (symptomInput === '') {
			return;
		}
		hideOutput = false;
		if (!therapistMode) {
			queryPromise = queryCohere(symptomInput, TESTING);
		} else {
			queryPromise = getTherapy(symptomInput, TESTING);
		}
	}

	$: therapistMode, reset();
	function reset() {
		symptomInput = '';
		hideOutput = true;
		queryPromise = null;
	}

	let showDetails = new Array(10).fill(false);

	// Function to toggle the visibility of an illness's details
	function toggleDetails(index) {
		showDetails[index] = !showDetails[index];
	}
	function fillShowDetails(val, end) {
		for (let i = 0; i < end; i++) {
			showDetails[i] = val;
		}
	}
</script>

<div
	class="flex flex-row items-center justify-center"
	style="background-image: url('bg.jpg'); background-size: cover; background-position: center;"
>
	<div class="flex flex-col items-center justify-center h-screen" class:shift-left={!hideOutput}>
		<!-- center this div vertically -->
		<div class="flex">
			<h1 class="text-6xl text-white">Dr. AI</h1>
			<img src="doctor-icon.png" alt="Logo" class="w-16 h-16" />
		</div>
		<label>
			<input type="checkbox" bind:checked={therapistMode} />
			Therapist mode {therapistMode}
		</label>
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div class="m-4 w-[32rem]">
			<h1>{therapistMode ? 'How was your day?' : 'Find your illness and find the cure!'}</h1>
			<div class="flex flex-row px-3 py-2 space-x-2 bg-white rounded-md shadow-md">
				<button class="bg-inherit" on:click={search}>&#128269;</button>
				<input
					id="symptomInput"
					class="w-full text-black bg-inherit focus:outline-none"
					type="text"
					placeholder={therapistMode ? "I'm here for you :)" : 'Tell us about your symptoms'}
					bind:value={symptomInput}
					on:keypress={(e) => {
						if (e.key === 'Enter') {
							search();
						}
					}}
				/>
				{#if symptomInput}
					<button
						in:fade={{ delay: 50, duration: 150 }}
						out:fade={{ delay: 50, duration: 150 }}
						on:click={() => {
							symptomInput = '';
						}}
					>
						&#10005;
					</button>
				{/if}
			</div>
			{#if !therapistMode}
				<div class="mt-2">
					<p>Common Illness Symptoms:</p>
					<div class="flex flex-wrap">
						{#each symptoms as symptom}
							<button
								class="px-2 py-1 m-1 transition-colors duration-150 bg-white rounded-md shadow-sm cursor-pointer hover:bg-slate-100"
								on:click={() => addSymptom(symptom)}
							>
								{symptom}
							</button>
						{/each}
					</div>
				</div>
			{/if}
			{#if avatar}
				<div class="relative">
					<img class="object-cover w-full mt-4 h-80" src={avatar} alt="Uploaded" />
					<button
						class="absolute top-0 right-0 px-2 py-1 -mt-2 -mr-2 text-white bg-red-400 rounded-md hover:bg-red-500"
						on:click={removeImage}
					>
						X
					</button>
				</div>
			{/if}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			{#if !therapistMode}
				<div class="mt-4 text-black cursor-pointer" on:click={() => fileinput.click()}>
					Don't know how to describe your symptom?
					<button class="px-2 py-1 ml-2 text-white bg-red-400 rounded-md hover:bg-red-500">
						Upload an image
					</button>
				</div>
			{/if}
			{#if !therapistMode}
				<input
					style="display:none"
					type="file"
					accept=".jpg, .jpeg, .png"
					on:change={(e) => onFileSelected(e)}
					bind:this={fileinput}
				/>
			{/if}
		</div>
	</div>

	<div>
		<div
			class="transition-opacity duration-1000 ease-in-out delay-500 opacity-0"
			class:opacity-100={!hideOutput}
		>
			{#if queryPromise}
				{#await queryPromise}
					<div class="text-xl font-semibold text-gray-700 loading-animation w-[32rem] px-4">
						<div class="spinner" />
					</div>
				{:then response}
					{#if therapistMode}
						<div
							class="w-[32rem] bg-white h-[20rem] rounded-md p-4 shadow-md items-center flex"
							in:fade
						>
							<p class="text-lg"><i class="text-sm">Response from Dr. AI:</i><br />{response}</p>
						</div>
					{:else}
						<div class="w-[32rem] overflow-y-scroll h-[32rem] overflow-x-hidden px-4" in:fade>
							<div>
								<button
									class="px-4 py-1 mt-2 text-white bg-blue-500 rounded-md"
									on:click={() =>
										fillShowDetails(
											!showDetails.every((v, i) => i >= response.length || v),
											response.length
										)}
									>{showDetails.every((v, i) => i >= response.length || v)
										? 'Collapse all'
										: 'Expand all'}</button
								>
							</div>
							{#each response as illness, index}
								<div class="p-4 my-4 bg-white border rounded-md shadow-sm">
									<p class="text-lg font-semibold">{illness.name}</p>
									<button
										class="px-4 py-1 mt-2 text-white bg-blue-500 rounded-md"
										on:click={() => toggleDetails(index)}
									>
										{showDetails[index] ? 'Hide details' : 'Show details'}
									</button>
									{#if showDetails[index]}
										<div
											class="p-4 mt-2 bg-gray-100 rounded-md shadow-inner"
											style={showDetails[index] ? 'display-block' : 'display-none'}
										>
											<p class="text-sm">
												<span class="font-bold">Explanation:</span>
												{illness.why}
											</p>
											<p class="text-sm">
												<span class="font-bold">Next steps:</span>
												{illness.next}
											</p>
											<p class="text-sm">
												<span class="font-bold">Confidence:</span>
												{illness.confidence}
											</p>
										</div>
									{/if}
								</div>
							{/each}
						</div>
					{/if}
				{/await}
			{/if}
		</div>
	</div>
</div>

<style>
	.loading-animation {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100px;
	}

	.spinner {
		border: 8px solid rgba(255, 255, 255, 0.3);
		border-radius: 50%;
		border-top: 4px solid #3498db;
		width: 80px;
		height: 80px;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
	.shift-left {
		transform: translateX(-20%);
		transition: transform 0.5s ease-in-out;
	}
</style>
