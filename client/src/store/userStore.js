import { Store } from '@tanstack/store'

export const userStore = new Store({
	user: null,
	isLoggedIn: false,
	loading: true,
})

export const setUser = (user) => {
	userStore.setState({
		user,
		isLoggedIn: !!user,
		loading: false,
	})
}

export const clearUser = () => {
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
