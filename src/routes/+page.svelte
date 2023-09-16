<script>
	import prompt from '../lib/cohere.js';

	let symptoms = [
		'F Fever',
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
			// Upload the image to Flask
			uploadImageToFlask(image);
		};
	};

    let imageCaption = ""
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
                imageCaption = captions[0].generated_text;
			} else {
				console.error('Error uploading image');
			}
		} catch (error) {
			console.error('Error:', error);
		}
	}

	let hideOutput = true;
	function search() {
		hideOutput = false;
	}

	let illnesses = [];
	prompt('I have a runny nose.').then((response) => {
		// console.log(response);
		illnesses = response;
	});

	let showDetails = new Array(10).fill(false);

	function toggleDetails(index) {
		showDetails[index] = !showDetails[index];
	}
</script>

<div
	class="flex flex-row justify-center items-center"
	style="background-image: url('/src/assets/bg.jpg'); background-size: cover; background-position: center;"
>
	<div
		class="flex flex-col justify-center items-center h-screen translate-x-[13%]"
		class:shift-left={!hideOutput}
	>
		<!-- center this div vertically -->
		<div class="flex">
			<h1 class="text-6xl text-white">Dr. AI</h1>
			<img src="/src/assets/doctor-icon.png" alt="Logo" class="h-16 w-16" />
		</div>
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div class="m-4">
			<h1>Find your illness and find the cure!</h1>
			<div class="flex flex-row bg-white py-2 px-3 space-x-2 rounded-md">
				<button class="bg-inherit" on:click={search}>&#128269;</button>
				<input
					id="symptomInput"
					class="w-[32rem] bg-inherit focus:outline-none text-black"
					type="text"
					placeholder="Tell us about your symptoms"
                    value={imageCaption ? imageCaption : ""}
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
		<p
			class="opacity-0 transition-opacity ease-in-out duration-1000 delay-500"
			class:opacity-100={!hideOutput}
		>
			{#if illnesses && illnesses.length > 0}
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
			{:else}
				<p class="text-xl font-semibold text-gray-700 loading-message">Loading...</p>
			{/if}
		</p>
	</div>
</div>

<style>
	.shift-left {
		transform: translateX(-20%);
		transition: transform 0.5s ease-in-out;
	}
</style>
