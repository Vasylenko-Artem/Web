// Task1
// window.addEventListener('load', () => {
// 	console.log('Page loaded.')
// })

// window.addEventListener('resize', () => {
// 	console.log('Page resized.')
// })

// Task2
window.addEventListener('DOMContentLoaded', () => {
	const element = document.querySelectorAll('h1, h2, h3, h4, h5, h6')

	element.forEach((el) => {
		el.addEventListener('click', () => {
			console.log(el.innerHTML + ' click')

			const oldText = el.textContent

			el.classList.add('hidden')

			setTimeout(() => {
				el.textContent = 'Click!'
				el.classList.remove('hidden')
			}, 150)

			setTimeout(() => {
				el.classList.add('hidden')
				setTimeout(() => {
					el.textContent = oldText
					el.classList.remove('hidden')
				}, 150)
			}, 650)
		})

		el.addEventListener('mouseover', () => {
			console.log(el.tagName + ' mouseover')
			el.classList.add('mousemove')

			el.addEventListener('mouseout', () => {
				el.classList.remove('mousemove')
			})
		})
	})
})

// Task3
const runTask = document.getElementById('runTask')

if (runTask) {
	runTask.addEventListener('click', () => {
		const userAgent = navigator.userAgent
		let browserName = 'Невідомий браузер'

		if (userAgent.includes('Firefox')) {
			browserName = 'Mozilla Firefox'
		} else if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
			browserName = 'Google Chrome'
		} else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
			browserName = 'Apple Safari'
		} else if (userAgent.includes('Edg')) {
			browserName = 'Microsoft Edge'
		} else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
			browserName = 'Opera'
		}

		const message = `Ви використовуєте: ${browserName}\nUser-Agent: ${userAgent}`

		alert(message)
	})
}

// Task4
window.addEventListener('load', () => {
	const images = document.querySelectorAll('img')

	images.forEach((el) => {
		el.addEventListener('click', () => {
			console.log(el.src + ' click')
		})
	})
})

// Task5
document.querySelectorAll('.auto-resize').forEach((el) => {
	el.addEventListener('input', () => {
		el.style.height = 'auto'
		el.style.height = el.scrollHeight + 'px'
	})
})

const input = document.getElementById('inputText')
const button = document.getElementById('searchBtn')
const resultsDiv = document.getElementById('results')

if (button) {
	button.addEventListener('click', () => {
		const text = input.value.trim()

		// 1. Кількість слів (українські + латинські)
		const words = text.match(/[А-Яа-яЇїІіЄєҐґA-Za-z]+/gu) || []
		const wordCount = words.length

		// 2. Слова, що починаються з букви і закінчуються на р або и
		const specialWords = text.match(/\b[А-Яа-яЇїІіЄєҐґA-Za-z][А-Яа-яЇїІіЄєҐґA-Za-z'-]*[рРиИ](?=[\s.,!?:;]|$)/gu) || []

		// 3. Кількість цифр
		const digits = text.match(/\d/g) || []
		const digitCount = digits.length

		// 4. Цілі числа
		const integers = text.match(/\b\d+\b/g) || []

		resultsDiv.textContent = [
			`Кількість слів: ${wordCount}`,
			`Слова, які починаються на букву і закінчуються на "р" або "и": ${specialWords.join(', ')}`,
			`Кількість цифр: ${digitCount}`,
			`Цілі числа: ${integers.join(', ')}`,
		].join('\n')
	})
}

// Task6
const arrayBtn = document.getElementById('arrayTaskBtn')
const arrayOutput = document.getElementById('arrayOutput')

if (arrayBtn) {
	arrayBtn.addEventListener('click', () => {
		console.log('hello')

		const sizeInput = document.getElementById('arraySize')
		const N = parseInt(sizeInput.value)

		if (isNaN(N) || N <= 0) {
			alert('Будь ласка, введіть додатне число!')
			return
		}

		// 1. Створення масиву A розміру N з випадкових чисел (наприклад, від 1 до 10)
		const A = Array.from({ length: N }, () => Math.floor(Math.random() * 10) + 1)

		// 2. Array processing: first half *2, second *3
		const half = Math.floor(N / 2)
		const processed = A.map((value, index) => (index < half ? value * 2 : value * 3))

		// 3. Виведення результату у textarea
		arrayOutput.value = `Початковий масив: ${A.join(', ')}\n` + `Оброблений масив: ${processed.join(', ')}`
	})
}
