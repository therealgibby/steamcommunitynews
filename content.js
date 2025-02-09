(() => {
	let gameTitle;

	chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
		const { type } = message;

		if (type === "STORE") {
			steamStorePageVisited();
		}

		if (type === "VIDS") {
			fillVideoSection(message.videos);
		}
	});

	// when the user loads a steam store page
	function steamStorePageVisited() {
		const videoSectionExists = document.getElementById("videoSection");

		if (!videoSectionExists) {
			setGameTitle();
			createVideoSection();
			findRelatedVideos();
		}
	}

	function setGameTitle() {
		gameTitle = document.getElementById("appHubAppName").getHTML();
	}

	function createVideoSection() {
		const gameContentArea = document.getElementById("appHubAppName");

		const videoBlock = document.createElement("div");
		videoBlock.classList.add("videoBlock");

		const title = document.createElement("h2");
		title.innerHTML = `From The Community`;
		title.id = "videoSectionTitle";

		const videoSection = document.createElement("div");
		videoSection.id = "videoSection";

		videoBlock.append(title, videoSection);

		gameContentArea.append(videoBlock);
	}

	function findRelatedVideos() {
		chrome.runtime.sendMessage({ type: "FETCH", gameTitle });
	}

	function fillVideoSection(videos) {
		const videoSection = document.getElementById("videoSection");

		videos.data.sort(
			(a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
		);
		for (let videoData of videos.data) {
			const videoElement = document.createElement("a");
			const videoThumbnail = document.createElement("img");
			const videoTitle = document.createElement("h2");
			const channelAndDateContainer = document.createElement("div");
			const videoChannelTitle = document.createElement("h2");
			const videoDate = document.createElement("h2");

			videoElement.classList.add("communityVideo");
			videoElement.href = `https://www.youtube.com/watch?v=${videoData.videoId}`;
			videoElement.target = "_blank";

			videoThumbnail.src = videoData.thumbnail.url;
			videoThumbnail.width = videoData.thumbnail.width;
			videoThumbnail.height = videoData.thumbnail.height;

			videoTitle.id = "communityVideoTitle";
			videoTitle.innerText = videoData.title
				.replace(/&amp;/g, "&")
				.replace(/&lt;/g, "<")
				.replace(/&gt;/g, ">")
				.replace(/&quot;/g, '"')
				.replace(/&#39;/g, "'");

			channelAndDateContainer.id = "channelAndDateContainer";
			videoChannelTitle.innerText = videoData.channelTitle;
			videoDate.innerText = new Date(
				videoData.publishedAt
			).toLocaleDateString();

			channelAndDateContainer.append(videoChannelTitle, videoDate);

			videoElement.append(
				videoThumbnail,
				videoTitle,
				channelAndDateContainer
			);

			videoSection.append(videoElement);
		}
	}
})();
