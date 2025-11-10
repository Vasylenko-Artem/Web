// Playlist data
const tracksData = [
	{
		title: 'Mercury Retrograde',
		artist: 'Ghostemane',
		cover: 'media/Ghostemane/Ghostemane_Mercury_Retrograde.jpg',
		audio: 'media/Ghostemane/Ghostemane_Mercury_Retrograde.mp3',
		video: 'media/Ghostemane/Ghostemane_Mercury_Retrograde.mp4',
	},
	{
		title: 'Pump It',
		artist: 'The Black Eyed Peas',
		cover: 'media/The_Black_Eyed_Peas/The_Black_Eyed_Peas_Pump_It.jpg',
		audio: 'media/The_Black_Eyed_Peas/The_Black_Eyed_Peas_Pump_It.mp3',
		video: 'media/The_Black_Eyed_Peas/The_Black_Eyed_Peas_Pump_It.mp4',
	},
]

// Elements
const mediaToggle = document.getElementById('mediaToggle')
const toggleOptions = mediaToggle.querySelectorAll('.media-toggle-option')

const cover = document.getElementById('cover')
const videoPlayer = document.getElementById('videoPlayer')
const audioPlayer = document.getElementById('audioPlayer')

const playPauseBtn = document.getElementById('playPause')
const prevBtn = document.getElementById('prevBtn')
const nextBtn = document.getElementById('nextBtn')
const progress = document.getElementById('progress')
const timeLabel = document.getElementById('time')
const durationLabel = document.getElementById('duration')

const trackTitle = document.getElementById('trackTitle')
const trackArtist = document.getElementById('trackArtist')
const playlistEl = document.getElementById('playlist')
const playlistStats = document.getElementById('playlistStats')

// State
let currentTrackIndex = 0
let currentMode = 'audio'
let currentMedia = audioPlayer
let wakeLock = null

// Wake Lock API - prevents the screen from falling asleep during playback
async function requestWakeLock() {
	try {
		if ('wakeLock' in navigator) {
			wakeLock = await navigator.wakeLock.request('screen')
			wakeLock.addEventListener('release', () => {
				console.log('Wake Lock released')
			})
		}
	} catch (err) {
		console.error('Wake Lock error:', err)
	}
}

async function releaseWakeLock() {
	if (wakeLock !== null) {
		await wakeLock.release()
		wakeLock = null
	}
}

// Initialize playlist
function renderPlaylist() {
	playlistEl.innerHTML = ''
	tracksData.forEach((track, index) => {
		const item = document.createElement('div')
		item.className = `playlist-item ${index === currentTrackIndex ? 'active' : ''}`
		item.innerHTML = `
					<div class="playlist-item-index">${index + 1}</div>
					<img src="${track.cover}" alt="${track.title}" class="playlist-item-cover">
					<div class="playlist-item-info">
						<div class="playlist-item-title">${track.title}</div>
						<div class="playlist-item-artist">${track.artist}</div>
					</div>
				`
		item.addEventListener('click', () => loadTrack(index))
		playlistEl.appendChild(item)
	})

	playlistStats.textContent = `${tracksData.length} ${tracksData.length === 1 ? 'трек' : 'треки'}`
}

// Media Session API - integration with system controls
function updateMediaSession(track) {
	if ('mediaSession' in navigator) {
		navigator.mediaSession.metadata = new MediaMetadata({
			title: track.title,
			artist: track.artist,
			album: '',
			artwork: [{ src: track.cover, sizes: '512x512', type: 'image/jpeg' }],
		})

		navigator.mediaSession.setActionHandler('play', () => {
			currentMedia.play()
			playPauseBtn.textContent = '⏸'
			playPauseBtn.classList.add('playing')
		})
		navigator.mediaSession.setActionHandler('pause', () => {
			currentMedia.pause()
			playPauseBtn.textContent = '▶'
			playPauseBtn.classList.remove('playing')
		})
		navigator.mediaSession.setActionHandler('previoustrack', () => {
			prevBtn.click()
		})
		navigator.mediaSession.setActionHandler('nexttrack', () => {
			nextBtn.click()
		})

		navigator.mediaSession.setActionHandler('seekbackward', (details) => {
			currentMedia.currentTime = Math.max(currentMedia.currentTime - (details.seekOffset || 10), 0)
		})
		navigator.mediaSession.setActionHandler('seekforward', (details) => {
			currentMedia.currentTime = Math.min(currentMedia.currentTime + (details.seekOffset || 10), currentMedia.duration)
		})
		navigator.mediaSession.setActionHandler('seekto', (details) => {
			if (details.fastSeek && 'fastSeek' in currentMedia) {
				currentMedia.fastSeek(details.seekTime)
			} else {
				currentMedia.currentTime = details.seekTime
			}
			updateProgress()
		})
	}
}

// Load track
function loadTrack(index) {
	currentTrackIndex = index
	const track = tracksData[index]

	trackTitle.textContent = track.title
	trackArtist.textContent = track.artist

	cover.src = track.cover
	videoPlayer.poster = track.cover

	audioPlayer.src = track.audio
	videoPlayer.src = track.video

	playPauseBtn.textContent = '▶'
	playPauseBtn.classList.remove('playing')
	progress.value = 0
	progress.style.setProperty('--progress', '0%')
	timeLabel.textContent = '0:00'

	renderPlaylist()
	currentMedia.load()

	// Integration with Media Session API
	updateMediaSession(track)

	// LocalStorage API - we save the current track
	try {
		localStorage.setItem('lastTrackIndex', index)
		localStorage.setItem('lastMode', currentMode)
	} catch (e) {
		console.log('LocalStorage не доступний')
	}

	// Document API - we update the title of the document
	document.title = `${track.title} - ${track.artist}`
}

// Update progress
function updateProgress() {
	if (!currentMedia.duration) return

	const percent = (currentMedia.currentTime / currentMedia.duration) * 100
	progress.value = percent
	progress.style.setProperty('--progress', percent + '%')

	const minutes = Math.floor(currentMedia.currentTime / 60)
	let seconds = Math.floor(currentMedia.currentTime % 60)
	if (seconds < 10) seconds = '0' + seconds
	timeLabel.textContent = `${minutes}:${seconds}`

	// We update the position in the Media Session API
	if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
		try {
			navigator.mediaSession.setPositionState({
				duration: currentMedia.duration,
				playbackRate: currentMedia.playbackRate,
				position: currentMedia.currentTime,
			})
		} catch (e) {
			console.log('Position state error:', e)
		}
	}
}

// Update duration
function updateDuration() {
	if (!currentMedia.duration) return

	const minutes = Math.floor(currentMedia.duration / 60)
	let seconds = Math.floor(currentMedia.duration % 60)
	if (seconds < 10) seconds = '0' + seconds
	durationLabel.textContent = `${minutes}:${seconds}`
}

// Switch mode
function switchMode(mode) {
	currentMode = mode
	currentMedia.pause()
	const wasPlaying = playPauseBtn.classList.contains('playing')
	const currentTime = currentMedia.currentTime

	if (mode === 'audio') {
		currentMedia = audioPlayer
		cover.classList.add('active')
		videoPlayer.classList.remove('active')
	} else {
		currentMedia = videoPlayer
		cover.classList.remove('active')
		videoPlayer.classList.add('active')
	}

	if (currentMedia.duration) {
		currentMedia.currentTime = currentTime
	}

	if (wasPlaying) {
		currentMedia.play()
	}

	updateDuration()

	// We save the mode in localStorage
	try {
		localStorage.setItem('lastMode', mode)
	} catch (e) {
		console.log('LocalStorage не доступний')
	}
}

// Media toggle
mediaToggle.addEventListener('click', () => {
	const newMode = currentMode === 'audio' ? 'video' : 'audio'
	toggleOptions.forEach((opt) => {
		opt.classList.toggle('active', opt.dataset.mode === newMode)
	})
	switchMode(newMode)
})

// Controls
playPauseBtn.addEventListener('click', () => {
	if (currentMedia.paused) {
		currentMedia.play()
		playPauseBtn.textContent = '⏸'
		playPauseBtn.classList.add('playing')
		requestWakeLock() // Wake Lock API - активуємо при відтворенні
	} else {
		currentMedia.pause()
		playPauseBtn.textContent = '▶'
		playPauseBtn.classList.remove('playing')
		releaseWakeLock() // Wake Lock API - відпускаємо при паузі
	}
})

prevBtn.addEventListener('click', () => {
	currentTrackIndex = (currentTrackIndex - 1 + tracksData.length) % tracksData.length
	loadTrack(currentTrackIndex)
	currentMedia.play()
	playPauseBtn.textContent = '⏸'
	playPauseBtn.classList.add('playing')
})

nextBtn.addEventListener('click', () => {
	currentTrackIndex = (currentTrackIndex + 1) % tracksData.length
	loadTrack(currentTrackIndex)
	currentMedia.play()
	playPauseBtn.textContent = '⏸'
	playPauseBtn.classList.add('playing')
})

progress.addEventListener('input', () => {
	if (currentMedia.duration) {
		currentMedia.currentTime = (progress.value / 100) * currentMedia.duration
	}
})

// Events
audioPlayer.addEventListener('timeupdate', () => {
	if (currentMedia === audioPlayer) updateProgress()
})

videoPlayer.addEventListener('timeupdate', () => {
	if (currentMedia === videoPlayer) updateProgress()
})

audioPlayer.addEventListener('loadedmetadata', () => {
	if (currentMedia === audioPlayer) updateDuration()
})

videoPlayer.addEventListener('loadedmetadata', () => {
	if (currentMedia === videoPlayer) updateDuration()
})

audioPlayer.addEventListener('ended', () => {
	if (currentMedia === audioPlayer) {
		playPauseBtn.textContent = '▶'
		playPauseBtn.classList.remove('playing')
		nextBtn.click()
	}
})

videoPlayer.addEventListener('ended', () => {
	if (currentMedia === videoPlayer) {
		playPauseBtn.textContent = '▶'
		playPauseBtn.classList.remove('playing')
		nextBtn.click()
	}
})

// Initialize
renderPlaylist()

// LocalStorage API - restore the last track when loading
try {
	const lastTrackIndex = localStorage.getItem('lastTrackIndex')
	const lastMode = localStorage.getItem('lastMode')

	if (lastTrackIndex !== null) {
		loadTrack(parseInt(lastTrackIndex))
	} else {
		loadTrack(0)
	}

	if (lastMode && lastMode !== currentMode) {
		toggleOptions.forEach((opt) => {
			opt.classList.toggle('active', opt.dataset.mode === lastMode)
		})
		switchMode(lastMode)
	}
} catch (e) {
	console.log('LocalStorage не доступний')
	loadTrack(0)
}

document.addEventListener('visibilitychange', () => {
	if (document.hidden) {
	}
})

// Release Wake Lock when closing the page
window.addEventListener('beforeunload', () => {
	releaseWakeLock()
})

// Keyboard API - keyboard shortcuts
document.addEventListener('keydown', (e) => {
	// Ignored if the focus is on the input
	if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

	switch (e.code) {
		case 'Space':
			e.preventDefault()
			playPauseBtn.click()
			break
		case 'ArrowLeft':
			e.preventDefault()
			currentMedia.currentTime = Math.max(currentMedia.currentTime - 5, 0)
			break
		case 'ArrowRight':
			e.preventDefault()
			currentMedia.currentTime = Math.min(currentMedia.currentTime + 5, currentMedia.duration)
			break
		case 'ArrowUp':
			e.preventDefault()
			prevBtn.click()
			break
		case 'ArrowDown':
			e.preventDefault()
			nextBtn.click()
			break
		case 'KeyM':
			e.preventDefault()
			mediaToggle.click()
			break
	}
})
