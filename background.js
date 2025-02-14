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

	// sends a message to the frontend if videos are found
	// frontend expects videos.data so send all json
	function fetchYoutubeVideos(gameTitle, tabId) {
		if (typeof gameTitle === "string") {
			fetch(`http://localhost:8080/api/ytsearch?gameTitle=${gameTitle}`)
				.then((response) => {
					if (response.ok) {
						response
							.json()
							.then((json) => {
								chrome.tabs.sendMessage(tabId, {
									type: "VIDS",
									videos: json,
								});
							})
							.catch((jsonError) => {
								console.log(jsonError);
							});
					} else {
						response
							.json()
							.then((json) => Promise.reject(json))
							.catch((returnedError) =>
								console.log(returnedError)
							);
					}
				})
				.catch((callError) => {
					console.log(callError);
				});
		}
	}
})();
