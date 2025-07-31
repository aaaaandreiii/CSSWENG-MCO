<script lang="ts">
	import { PUBLIC_API_BASE_URL } from '$env/static/public';
	import {onMount} from 'svelte';
	import {userProfile} from '$lib/stores/user';

	type UserDetails = { 
		userId: number; 
		name: string; 
		user: string; 
		date: string; 
		position: string; 
		password: string;
		profilePic: string;
	};

	let details: UserDetails[] = [];
	let list: UserDetails[] = [];
	let showPhotoModal = false;
	let showEditModal = false;
	let isDragging = false;
	let fileInput: HTMLInputElement;
	let editForm = {
		name: '',
		user: '',
		position: '',
		newPassword: '',
		confirmPassword: '',
		profilePic: ''
	};
	let showNewPassword = false;
    let showConfirmPassword = false;

	async function fetchProfile(){
		try{
			// TODO for backend: ensure getUserProfile API returns correct user data structure
			const token = localStorage.getItem('token');
			const res = await fetch(`${PUBLIC_API_BASE_URL}/api/getUserProfile`, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});
			const data = await res.json();
			details = [{
				userId: Number(data.user.userId),
				name: data.user.fullName,
				user: data.user.username,
				date: new Date(data.user.dateAdded).toLocaleDateString('en-PH', {
					timeZone: 'Asia/Manila'
				}),
				position: data.user.userRole,
				password: data.user.userPassword,
				profilePic: data.user.pathName || "../src/icons/user.svg"
			}]
		}catch(err){
			console.error("Error fetching user data: ", err);
		}
	}

	async function fetchUsers(){
		try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${PUBLIC_API_BASE_URL}/api/getUsers`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await res.json();
            console.log('Fetched data:', data);
            list = data.users.map((item: any) => ({
                userId: item.userId,
                name: item.fullName,
                user: item.username,
                date: new Date(item.dateAdded).toLocaleDateString('en-PH', {
                    timeZone: 'Asia/Manila'
                }),
                position: item.userRole,
                password: item.userPassword,
                profilePic: item.pathName || "../src/icons/user.svg"
            }));
        } catch (err) {
            console.error('Error fetching user lists:', err);
        }
	}

	onMount(async() =>{
		fetchProfile();
		fetchUsers();
	});

	function openPhotoModal() {
		showPhotoModal = true;
	}

	function closePhotoModal() {
		showPhotoModal = false;
		isDragging = false;
	}

	function openEditModal() {
		if (details.length > 0) {
			editForm = {
				name: details[0].name,
				user: details[0].user,
				position: details[0].position,
				newPassword: '',
				confirmPassword: '',
				profilePic: details[0].profilePic === "../src/icons/user.svg" ? '' : details[0].profilePic
			};
		}
		showEditModal = true;
	}

	function closeEditModal() {
		showEditModal = false;
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		isDragging = true;
	}

	function handleDragLeave(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
		const files = e.dataTransfer?.files;
		if (files && files.length > 0) {
			handleFileUpload(files[0]);
		}
	}

	function handleFileSelect(e: Event) {
		const target = e.target as HTMLInputElement;
		const files = target.files;
		if (files && files.length > 0) {
			handleFileUpload(files[0]);
		}
	}

	function handleFileUpload(file: File) {
		if (!file.type.match(/^image\/(png|jpe?g)$/)) {
			alert('Please upload a PNG or JPG image.');
			return;
		}

		const reader = new FileReader();
		reader.onload = (e) => {
			const img = new Image();
			img.onload = () => {
				const canvas = document.createElement('canvas');
				const ctx = canvas.getContext('2d');
				if (!ctx) return;

				// set to 750x750px constantly
				const size = 750;
				canvas.width = size;
				canvas.height = size;

				// calculating the max size of the image to fit in the canvas
				const scale = Math.max(size / img.width, size / img.height);
				const scaledWidth = img.width * scale;
				const scaledHeight = img.height * scale;
				const x = (size - scaledWidth) / 2;
				const y = (size - scaledHeight) / 2;

				// make the image centered and scaled properly
				ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
				
				// Convert to data URL and update profile picture
				const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
				
				// TODO for backend: send the dataUrl to backend to save profile picture
				details = details.map(detail => ({
					...detail,
					profilePic: dataUrl
				}));
				
				closePhotoModal();
			};
			img.src = e.target?.result as string;
		};
		reader.readAsDataURL(file);
	}

	async function saveEditProfile() {
		if (details.length > 0) {
			// TODO for backend: send updated profile data to backend API
			if(list && (list.find((u: UserDetails) => u.user.trim().toLowerCase() === editForm.user.trim().toLowerCase() && u.userId !== details[0].userId))){
				alert("Username already exists.");
				return;
			}
			if(editForm.profilePic.trim() !== ''){
				try{
					new URL(editForm.profilePic.trim());
				}catch(_) {
					alert("Invalid path name.");
					return;
				}
			}
			if(!((!editForm.newPassword.trim() && !editForm.confirmPassword.trim()) || (editForm.newPassword.trim() && editForm.confirmPassword))){
				alert("Please confirm your password.");
				return;
			}
			if(editForm.newPassword !== editForm.confirmPassword){
				alert("Passwords do not match.");
				return;
			}
			
			// details = [{
			// 	...details[0],
			// 	name: editForm.name,
			// 	user: editForm.user
			// }];
			
			const payload: any = {
				userId: details[0].userId,
				fullName: editForm.name.trim(),
				userRole: details[0].position.trim(),
				username: editForm.user.trim(),
				pathName: editForm.profilePic.trim() || null
			};


			if(editForm.newPassword.trim()){
				payload.userPassword = editForm.newPassword;
			}

			try{
				const token = localStorage.getItem('token');
				const res = await fetch(`${PUBLIC_API_BASE_URL}/api/updateProfile`, {
					method:  'PUT',
					headers: {
						'Content-Type': 'application/json',
						Authorization:   `Bearer ${token}`
					},
					body: JSON.stringify(payload)
				});
				// const result = await res.json();
				if(!res.ok){
					alert("Error updating!");
					return;
				}
				await fetchProfile();
				//update sidebar info
				userProfile.set({
					userId: payload.userId,
					username: payload.username.trim(),
					role: payload.userRole.trim(),
					profilePic: (payload.pathName?.trim() || "../src/icons/user.svg")
				});
			}catch(err){
				console.error("Error updating profile: ", err);
			}
		}
		closeEditModal();
	}
</script>

<!-- profile card -->
{#each details as detail}
<div class="p-10">
	<section class="rounded-lg bg-white p-8">
		<div class="profile-photo mb-8 flex items-start gap-4">
			<img src={detail.profilePic} alt="Profile" class="avatar h-48 w-48 rounded-full" />
			<div class="upload-section flex flex-col items-start">
				<h1 class="text-5xl font-bold py-5">{detail.name}</h1>
                <button
					on:click={openPhotoModal}
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
			<button on:click={openEditModal} class="absolute top-0 right-0 rounded-lg bg-gray-200 px-4 py-2 font-bold">Edit</button>
		</div>
	</section>
</div>
{/each}

<!-- Photo Upload Modal -->
{#if showPhotoModal}
<div class="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
	<div class="bg-white rounded-lg p-6 w-96">
		<h2 class="text-xl font-bold mb-4">Upload Profile Picture</h2>
		
		<div 
			role="region"
			aria-label="Image upload dropzone"
			class="border-2 border-dashed rounded-lg p-8 text-center transition-colors {isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}"
			on:dragover={handleDragOver}
			on:dragleave={handleDragLeave}
			on:drop={handleDrop}
		>
			<p class="mb-4">Drag and drop your image here</p>
			<p class="text-gray-500 mb-4">or</p>
			<button 
				on:click={() => fileInput.click()}
				class="bg-blue-500 text-white px-4 py-2 rounded-lg"
			>
				Browse Files
			</button>
		</div>
		
		<input 
			bind:this={fileInput}
			type="file" 
			accept="image/png,image/jpeg,image/jpg" 
			class="hidden"
			on:change={handleFileSelect}
		/>
		
		<p class="text-sm text-gray-500 mt-4">
			PNG and JPG files only.
		</p>
		
		<div class="flex justify-end gap-2 mt-6">
			<button 
				on:click={closePhotoModal}
				class="px-4 py-2 bg-gray-200 rounded-lg"
			>
				Cancel
			</button>
		</div>
	</div>
</div>
{/if}

<!-- Edit Profile Modal -->
{#if showEditModal}
<div class="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
	<div class="bg-white rounded-lg p-6 w-96">
		<h2 class="text-xl font-bold mb-4">Edit Profile</h2>
		
		<form on:submit|preventDefault={saveEditProfile}>
			{#if $userProfile.role === 'admin'}
				<div class="mb-4">
					<label for="edit-fullName" class="block text-sm font-medium mb-2">Full Name</label>
					<input 
						id="edit-fullName"
						bind:value={editForm.name}
						type="text" 
						class="w-full border border-gray-300 rounded-lg px-3 py-2"
						required
					/>
				</div>
				<div class="mb-4"> <!-- Username Field, can change id as needed -->
					<!-- TODO for backend, update username -->
					<label for="edit-username" class="block text-sm font-medium mb-2">Username</label>
					<input 
						id="edit-username"
						bind:value={editForm.user}
						type="text" 
						class="w-full border border-gray-300 rounded-lg px-3 py-2"
						required
					/>
				</div>
				<div class="mb-4">
					<label for="edit-newPassword" class="block text-sm font-medium mb-2">New Password</label>
					<input 
						id="edit-newPassword"
						bind:value={editForm.newPassword}
						type={showNewPassword ? "text" : "password"}
						class="w-full border border-gray-300 rounded-lg px-3 py-2"
						
					/>
					<div class="flex items-center mt-2">
						<input
							type="checkbox"
							id="toggle-new-password"
							bind:checked={showNewPassword}
							class="mr-2"
						/>
						<label for="toggle-new-password" class="text-sm select-none">Show password</label>
					</div>
				</div>
				<div class="mb-4">
					<label for="edit-confirmPassword" class="block text-sm font-medium mb-2">Confirm Password</label>
					<input 
						id="edit-confirmPassword"
						bind:value={editForm.confirmPassword}
						type={showConfirmPassword ? "text" : "password"}
						class="w-full border border-gray-300 rounded-lg px-3 py-2"
						
					/>
					<div class="flex items-center mt-2">
						<input
							type="checkbox"
							id="toggle-confirm-password"
							bind:checked={showConfirmPassword}
							class="mr-2"
						/>
						<label for="toggle-confirm-password" class="text-sm select-none">Show password</label>
					</div>
				</div>
			{/if}
			<div class="mb-4">
				<label for="edit-profilePic" class="block text-sm font-medium mb-2">Profile Picture URL</label>
				<input 
					id="edit-profilePic"
					bind:value={editForm.profilePic}
					type="text" 
					class="w-full border border-gray-300 rounded-lg px-3 py-2"
					placeholder="Optional - leave empty for default"
				/>
			</div>
			<div class="flex justify-end gap-2">
				<button 
					type="button"
					on:click={closeEditModal}
					class="px-4 py-2 bg-gray-200 rounded-lg"
				>
					Cancel
				</button>
				<button 
					type="submit"
					class="px-4 py-2 bg-blue-500 text-white rounded-lg"
				>
					Save Changes
				</button>
			</div>
		</form>
	</div>
</div>
{/if}
