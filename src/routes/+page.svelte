<script>
	import queryCohere from '../lib/cohere.js';

    let TESTING = true;

	let symptoms = [
		'Fever',
		'Headache',
		'Cough',
		'Fatigue',
		'Sore Throat',
		'Nausea',
		'Shortness of Breath'
	];
	let uploadedImage = null;

	function addSymptom(symptom) {
		const inputField = document.querySelector('#symptomInput');
		inputField.value += ` ${symptom}`;
	}

	let avatar, fileinput;

	const onFileSelected = (e) => {
		let image = e.target.files[0];
		let reader = new FileReader();
		reader.readAsDataURL(image);
		reader.onload = (e) => {
			avatar = e.target.result;
		};
	};

	let symptomInput = '';
	let hideOutput = true;
	let queryPromise = null;
	async function search() {
        if (symptomInput === '') {
            return;
        }
		hideOutput = false;
		queryPromise = queryCohere(symptomInput, TESTING);
	}

	let showDetails = new Array(10).fill(false);

	// Function to toggle the visibility of an illness's details
	function toggleDetails(index) {
		showDetails[index] = !showDetails[index];
	}
</script>

<div
	class="flex flex-row justify-center items-center"
	style="background-image: url('/src/assets/bg.jpg'); background-size: cover; background-position: center;"
>
	<div class="flex flex-col justify-center items-center h-screen" class:shift-left={!hideOutput}>
		<!-- center this div vertically -->
		<div class="flex">
			<h1 class="text-6xl text-white">Dr. AI</h1>
			<img src="/src/assets/doctor-icon.png" alt="Logo" class="h-16 w-16" />
		</div>
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div class="m-4 w-[40rem]">
			<h1>Find your illness and find the cure!</h1>
			<div class="flex flex-row bg-white py-2 px-3 space-x-2 rounded-md">
				<button class="bg-inherit" on:click={search}>&#128269;</button>
				<input
					id="symptomInput"
					class="bg-inherit focus:outline-none text-black w-full"
					type="text"
					placeholder="Tell us about your symptoms"
					bind:value={symptomInput}
					on:keypress={(e) => {
						if (e.key === 'Enter') {
							search();
						}
					}}
				/>
			</div>
			<div class="mt-2">
				<p>Common Illness Symptoms:</p>
				<div class="flex flex-wrap">
					{#each symptoms as symptom}
						<button
							class="bg-white px-2 py-1 m-1 rounded-md cursor-pointer"
							on:click={() => addSymptom(symptom)}
						>
							{symptom}
						</button>
					{/each}
				</div>
			</div>
			{#if avatar}
				<img class="mt-4 h-64 w-64 rounded-full object-cover" src={avatar} alt="Uploaded" />
			{:else}
				<!-- Default avatar image -->
				<!-- <img class="avatar" src="https://cdn4.iconfinder.com/data/icons/small-n-flat/24/user-alt-512.png" alt="" /> -->
			{/if}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div class="mt-4 text-black cursor-pointer" on:click={() => fileinput.click()}>
				Don't know how to describe your symptom?
				<button class="bg-red-400 text-white px-2 py-1 rounded-md ml-2 hover:bg-red-500">
					Upload an image
				</button>
			</div>
			<input
				style="display:none"
				type="file"
				accept=".jpg, .jpeg, .png"
				on:change={(e) => onFileSelected(e)}
				bind:this={fileinput}
			/>
		</div>
	</div>

	<div>
		<div
			class="opacity-0 transition-opacity ease-in-out duration-1000 delay-500"
			class:opacity-100={!hideOutput}
		>
			{#if queryPromise}
				{#await queryPromise}
					<p class="animate-pulse">Loading</p>
				{:then illnesses}
                    <p>{illnesses.length}</p>
					{#each illnesses as illness, index}
						<div class="border p-4 my-4 rounded-md bg-white">
							<p class="text-lg font-semibold">Name: {illness.name}</p>
							<button
								class="bg-blue-500 text-white px-4 py-1 rounded-md mt-2"
								on:click={() => toggleDetails(index)}
							>
								{showDetails[index] ? 'Hide Details' : 'Show Details'}
							</button>
							{#if showDetails[index]}
								<div
									class="mt-2 p-4 bg-gray-100"
									style={showDetails[index] ? 'display-block' : 'display-none'}
								>
									<p class="text-sm"><span class="font-bold">Why:</span> {illness.why}</p>
									<p class="text-sm"><span class="font-bold">Next steps:</span> {illness.next}</p>
									<p class="text-sm">
										<span class="font-bold">Confidence:</span>
										{illness.confidence}
									</p>
								</div>
							{/if}
						</div>
					{/each}
				{/await}
			{/if}
		</div>
	</div>
</div>

<style>
	.shift-left {
		transform: translateX(-20%);
		transition: transform 0.5s ease-in-out;
	}
</style>
