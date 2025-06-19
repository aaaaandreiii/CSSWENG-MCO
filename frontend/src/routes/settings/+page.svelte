<script>
	let selected = "profile"; // default selected tab = profile
	let permissions = [
		{ name: "Can view", enabled: false },
		{ name: "Can edit", enabled: false },
		{ name: "Can approve", enabled: false },
		{ name: "Can create users", enabled: false },
	];
</script>

<div class="flex min-h-screen bg-gray-200">
	<div class="flex-1 p-8">
		<!-- header -->
		<header class="flex justify-between items-center mb-8">
			<h1 class="text-2xl font-normal">Settings</h1>
			<div class="bg-white rounded-4xl w-fit flex px-3">
                <input type="text" placeholder="Search" class="w-55 p-2" style = "outline:none" />
                <img src="../src/icons/search.svg" alt="search" style="width:15px; " />
            </div>
		</header>

		<!-- settings nav bar -->
		<nav class="mb-0.">
			<ul class="flex space-x-4">
				<li>
					<a
						href="#profile"
						class="text-lg px-4 {selected === 'profile' ? 'text-green-700 font-bold border-b-4 border-green-700' : 'text-black'}"
						on:click={() => (selected = 'profile')}
					>
						Profile
					</a>
				</li>
				<li>
					<a
						href="#admin"
						class="text-lg px-4 {selected === 'admin' ? 'text-green-700 font-bold border-b-4 border-green-700' : 'text-black'}"
						on:click={() => (selected = 'admin')}
					>
						Admin
					</a>
				</li>
				<li>
					<a
						href="#staff"
						class="text-lg px-4 {selected === 'staff' ? 'text-green-700 font-bold border-b-4 border-green-700' : 'text-black'}"
						on:click={() => (selected = 'staff')}
					>
						Staff
					</a>
				</li>
				<li>
					<a
						href="#auditor"
						class="text-lg px-4 {selected === 'auditor' ? 'text-green-700 font-bold border-b-4 border-green-700' : 'text-black'}"
						on:click={() => (selected = 'auditor')}
					>
						Auditor
					</a>
				</li>
				<li>
					<a
						href="#manager"
						class="text-lg px-4 {selected === 'manager' ? 'text-green-700 font-bold border-b-4 border-green-700' : 'text-black'}"
						on:click={() => (selected = 'manager')}
					>
						Manager
					</a>
				</li>
			</ul>
		</nav>
		<hr class="border-gray-300 mb-8">

		<!-- Conditional Rendering for Profile and Permissions Section -->
		{#if selected === 'profile'}
			<!-- profile card -->
			<section class="bg-white rounded-lg p-8">
				<div class="flex items-start gap-4 mb-8 profile-photo">
					<img src="../src/icons/user.svg" alt="Profile" class="avatar w-48 h-48 rounded-full" />
					<div class="upload-section flex flex-col items-start">
						<button class="upload-photo bg-gray-200 border-none rounded-lg px-6 py-3 font-bold cursor-pointer mb-2">
							Upload New Photo
						</button>
						<p class="photo-instructions text-gray-400 text-left">Recommended photo size is 750x750px. JPG or PNG is allowed.
						</p>
					</div>
				</div>

				<hr class="border-gray-300 mb-4">

				<!-- personal info content-->
				<div class="relative">
					<h2 class="text-lg font-bold mb-4">Personal Info</h2>
					<dl class="grid grid-cols-2 gap-4">
						<div>
							<dt class="text-gray-400 text-lg">Username</dt>
							<dd class="text-lg">Username123</dd>
						</div>
						<div>
							<dt class="text-gray-400 text-lg">Email</dt>
							<dd class="text-lg">email@gmail.com</dd>
						</div>
						<div>
							<dt class="text-gray-400 text-lg">Contact No.</dt>
							<dd class="text-lg">(+63) xxx xxx xxxx</dd>
						</div>
						<div>
							<dt class="text-gray-400 text-lg">Position</dt>
							<dd class="text-lg">Admin</dd>
						</div>
					</dl>
					<button class="absolute top-0 right-0 bg-gray-200 rounded-lg px-4 py-2 font-bold">Edit</button>
				</div>
			</section>
		{/if}
        
        <!-- permissions section, change roles as needed -->
		{#if selected === 'admin' || selected === 'staff' || selected === 'auditor' || selected === 'manager'}
			<section class="bg-white rounded-lg p-8 mt-8 w-fit">
				<h2 class="text-lg font-bold mb-4 flex items-center justify-between gap-25">
					<span>Permissions</span>
					<button class="bg-gray-200 text-black font-bold px-6 py-2 rounded-lg">Edit</button>
				</h2>
				<ul class="mb-8">
					{#each permissions as permission, index}
						<li class="flex justify-between items-center mb-4">
							<span class="text-lg">{permission.name}</span>
							<input type="checkbox" bind:checked={permissions[index].enabled} class="switch-toggle" />
						</li>
					{/each}
				</ul>
				<div class="flex justify-end space-x-4">
					<button class="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg">Cancel</button>
					<button class="bg-red-600 text-white font-bold px-6 py-2 rounded-lg">Save</button>
				</div>
			</section>
		{/if}
	</div>
</div>