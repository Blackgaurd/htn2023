<script>
	let symptoms = [
		'Fever',
		'Headache',
		'Cough',
		'Fatigue',
		'Sore Throat',
		'Nausea',
		'Shortness of Breath'
	];

	function addSymptom(symptom) {
		const inputField = document.querySelector('#symptomInput');
		inputField.value += ` ${symptom}`;
	}

	let hideOutput = true;
	function search() {
		hideOutput = false;
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
		<div class="m-4">
			<h1>Find your illness and find the cure!</h1>
			<div class="flex flex-row bg-white py-2 px-3 space-x-2 rounded-md">
				<button class="bg-inherit" on:click={search}>&#128269;</button>
				<input
					id="symptomInput"
					class="w-[32rem] bg-inherit focus:outline-none text-black"
					type="text"
					placeholder="Tell us about your symptoms"
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
		</div>
	</div>

	<div>
		<p
			class="opacity-0 transition-opacity ease-in-out duration-1000 delay-500"
			class:opacity-100={!hideOutput}
		>
			This is where the output is
		</p>
	</div>
</div>

<style>
	.shift-left {
		transform: translateX(-20%);
		transition: transform 0.5s ease-in-out;
	}
</style>
