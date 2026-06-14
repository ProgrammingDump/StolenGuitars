import { Store } from '@tanstack/store'

const STORAGE_KEY = 'stolen-guitars-user'

const readStoredUser = () => {
	try {
		const value = window.localStorage.getItem(STORAGE_KEY)
		return value ? JSON.parse(value) : null
	} catch {
		return null
	}
}

const storedUser = typeof window !== 'undefined' ? readStoredUser() : null

export const userStore = new Store({
	user: storedUser,
	isLoggedIn: !!storedUser,
	loading: true,
})

export const setUser = (user) => {
	window.localStorage.setItem(
		STORAGE_KEY,
		JSON.stringify(user),
	)
	userStore.setState({
		user,
		isLoggedIn: !!user,
		loading: false,
	})
}

export const clearUser = () => {
	window.localStorage.removeItem(STORAGE_KEY)
	userStore.setState({
		user: null,
		isLoggedIn: false,
		loading: false,
	})
}

export const setLoading = (value) => {
	userStore.setState((state) => ({
		...state,
		loading: value,
	}))
}
