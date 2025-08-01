// import { redirect } from '@sveltejs/kit';

// export function load() {
//     throw redirect(307, '/dashboard');
// }
import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { browser } from '$app/environment';

export const load: PageLoad = () => {
	if(browser){
		const token = localStorage.getItem('token');
		if(token) {
		    throw redirect(307, '/dashboard');
		}
		throw redirect(307, '/login');
	}
};
