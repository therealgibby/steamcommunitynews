(() => {
	chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
		if (tab.url && tab.url.includes("store.steampowered.com/app")) {
			chrome.tabs.sendMessage(tabId, {
				type: "STORE",
			});
		}
	});

	chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
		const { type, gameTitle } = message;

		if (type === "FETCH" && sender.tab && sender.tab.id) {
			fetchYoutubeVideos(gameTitle, sender.tab.id);
		}
	});

	// returns an object containing an array of video attributes or a an empty array
	async function fetchYoutubeVideos(gameTitle, tabId) {
		const videos = { data: [] };

		if (typeof gameTitle === "string") {
			const responseJson = await fetch(
				`http://localhost:8080/api/ytsearch?gameTitle=${gameTitle}`
			)
				.then((response) => {
					if (response.ok) return response.json();
					return response.json().then((json) => Promise.reject(json));
				})
				.catch((error) => {
					console.log(error);
					return null;
				});

			if (responseJson && responseJson.data) {
				videos.data = responseJson.data;
			}
		}

		chrome.tabs.sendMessage(tabId, {
			type: "VIDS",
			videos,
		});
	}
})();
