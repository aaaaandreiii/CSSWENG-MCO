<script>
	let details = [
        {name: 'Full Name', user: 'Useername123', date: 'January 19, 2955', position: 'Admin'},
	
	];

</script>


<!-- profile card -->
 {#each details as detail}
<div class="p-10">
	<section class="rounded-lg bg-white p-8">
		<div class="profile-photo mb-8 flex items-start gap-4">
			<img src="../src/icons/user.svg" alt="Profile" class="avatar h-48 w-48 rounded-full" />
			<div class="upload-section flex flex-col items-start">
				<h1 class="text-5xl font-bold py-5">{detail.name}</h1>
                <button
					class="upload-photo mb-2 cursor-pointer rounded-lg border-none bg-gray-200 px-6 py-3 font-bold"
				>
					Upload New Photo
				</button>
				<p class="photo-instructions text-left text-gray-400">
					Recommended photo size is 750x750px. JPG or PNG is allowed.
				</p>
			</div>
		</div>

		<hr class="mb-4 border-gray-300" />

		<!-- personal info content-->
		 
		<div class="relative">
			<h2 class="mb-4 text-lg font-bold">Personal Info</h2>
			<dl class="grid grid-cols-2 gap-4">
				<div>
					<dt class="text-lg text-gray-400">Username</dt>
					<dd class="text-lg">{detail.user}</dd>
				</div>
				<div>
					<dt class="text-lg text-gray-400">Creation Date</dt>
					<dd class="text-lg">{detail.date}</dd>
				</div>
				<div>
					<dt class="text-lg text-gray-400">Position</dt>
					<dd class="text-lg">{detail.position}</dd>
				</div>
			</dl>
			<button class="absolute top-0 right-0 rounded-lg bg-gray-200 px-4 py-2 font-bold">Edit</button
			>
		</div>
		
	</section>
</div>

{/each}
