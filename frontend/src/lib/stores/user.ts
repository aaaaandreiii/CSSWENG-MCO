import { writable } from 'svelte/store';

export const userProfile = writable({
    userId: null,
    username: '',
    role: '',
    profilePic: '/icons/user.svg'
});