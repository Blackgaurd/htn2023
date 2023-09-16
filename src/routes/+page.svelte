<script>
    let symptoms = ["Fever", "Headache", "Cough", "Fatigue", "Sore Throat", "Nausea", "Shortness of Breath"];
    let uploadedImage = null;

    function addSymptom(symptom) {
        const inputField = document.querySelector("#symptomInput");
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
    }
</script>

<div class="min-h-screen bg-cover bg-center flex flex-col items-center justify-center" style="background-image: url('/src/assets/bg.jpg');">
    <div class="text-black">
        <div class="flex items-center">
            <img src="/src/assets/doctor-icon.png" alt="Logo" class="h-16 w-16" />
            <h1 class="text-6xl">Dr. AI</h1>
        </div>
        <h2 class="text-2xl font-bold my-4">Find your illness and find the cure!</h2>
        <div class="bg-white py-2 px-3 space-x-2 rounded-md flex items-center">
            <button class="bg-inherit">&#128269;</button>
            <input
                id="symptomInput"
                class="w-[32rem] bg-inherit focus:outline-none text-black"
                type="text"
                placeholder="Tell us about your symptoms"
            />
        </div>
        <div class="mt-4">
            <p class="text-black">Common Illness Symptoms:</p>
            <div class="flex flex-wrap">
                {#each symptoms as symptom}
                    <button class="bg-white text-black px-2 py-1 m-1 rounded-md cursor-pointer" on:click={() => addSymptom(symptom)}>
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
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="mt-4 text-black cursor-pointer" on:click={() => fileinput.click()}>
            Don't know how to describe your symptom? 
            <button class="bg-red-400 text-white px-2 py-1 rounded-md ml-2 hover:bg-red-500">
                Upload an image
            </button>
        </div>
        <input style="display:none" type="file" accept=".jpg, .jpeg, .png" on:change={(e) => onFileSelected(e)} bind:this={fileinput} />
    </div>
</div>
